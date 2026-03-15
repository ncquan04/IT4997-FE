import { useEffect, useMemo, useState } from "react";
import {
  fetchProductAvailability,
  type IProductBranchAvailability,
} from "../../../services/api/api.products";

type GeoPoint = {
  lat: number;
  lon: number;
};

type ToastType = "success" | "error";
type ShowToast = (title: string, type: ToastType) => void;

const branchGeoCache = new Map<string, GeoPoint>();

const toRadians = (degree: number) => (degree * Math.PI) / 180;

const calculateDistanceKm = (from: GeoPoint, to: GeoPoint): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getUserCoordinatesByIp = async (): Promise<GeoPoint | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;

    const data = await response.json();
    const lat = Number(data?.latitude);
    const lon = Number(data?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
};

const getUserCoordinatesByBrowser = async (): Promise<GeoPoint | null> => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000,
      },
    );
  });
};

const geocodeAddress = async (address: string): Promise<GeoPoint | null> => {
  const cacheKey = address.trim().toLowerCase();
  if (!cacheKey) return null;

  if (branchGeoCache.has(cacheKey)) {
    return branchGeoCache.get(cacheKey) ?? null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = data?.[0];
    if (!first) return null;

    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const point = { lat, lon };
    branchGeoCache.set(cacheKey, point);
    return point;
  } catch {
    return null;
  }
};

const findNearestBranchByPoint = async (
  branches: IProductBranchAvailability[],
  userPoint: GeoPoint,
): Promise<string | null> => {
  const resolved = await Promise.all(
    branches.map(async (branch) => {
      const point = await geocodeAddress(branch.address);
      if (!point) return null;

      return {
        branchId: branch.branchId,
        distance: calculateDistanceKm(userPoint, point),
      };
    }),
  );

  const validDistances = resolved.filter(
    (item): item is { branchId: string; distance: number } =>
      item !== null && Number.isFinite(item.distance),
  );

  if (validDistances.length === 0) return null;

  validDistances.sort((a, b) => a.distance - b.distance);
  return validDistances[0].branchId;
};

const findNearestBranchByIp = async (
  branches: IProductBranchAvailability[],
): Promise<string | null> => {
  const userPoint = await getUserCoordinatesByIp();
  if (!userPoint) return null;

  return await findNearestBranchByPoint(branches, userPoint);
};

interface UseBranchAvailabilityParams {
  productId?: string;
  selectedVariantId?: string;
  showToast: ShowToast;
}

export const useBranchAvailability = ({
  productId,
  selectedVariantId,
  showToast,
}: UseBranchAvailabilityParams) => {
  const [branchAvailability, setBranchAvailability] = useState<
    IProductBranchAvailability[]
  >([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [nearestBranchId, setNearestBranchId] = useState("");
  const [isLocatingNearest, setIsLocatingNearest] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      if (!productId || !selectedVariantId) {
        if (isMounted) {
          setBranchAvailability([]);
          setIsLoadingAvailability(false);
          setSelectedBranchId("");
          setNearestBranchId("");
        }
        return;
      }

      setIsLoadingAvailability(true);
      const response = await fetchProductAvailability(
        productId,
        selectedVariantId,
      );

      if (!isMounted) return;

      setBranchAvailability(response?.branches ?? []);
      setIsLoadingAvailability(false);
    };

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [productId, selectedVariantId]);

  useEffect(() => {
    if (branchAvailability.length === 0) {
      setSelectedBranchId("");
      setNearestBranchId("");
      return;
    }

    let isMounted = true;

    const pickNearestBranch = async () => {
      const nearestId = await findNearestBranchByIp(branchAvailability);
      if (!isMounted) return;

      if (nearestId) {
        setSelectedBranchId(nearestId);
        setNearestBranchId(nearestId);
        return;
      }

      setSelectedBranchId((prev) => {
        const exists = branchAvailability.some(
          (branch) => branch.branchId === prev,
        );
        return exists ? prev : branchAvailability[0].branchId;
      });
      setNearestBranchId("");
    };

    pickNearestBranch();

    return () => {
      isMounted = false;
    };
  }, [branchAvailability]);

  const selectedBranch = useMemo(
    () =>
      branchAvailability.find((branch) => branch.branchId === selectedBranchId),
    [branchAvailability, selectedBranchId],
  );

  const handleUseCurrentLocation = async () => {
    if (branchAvailability.length === 0 || isLocatingNearest) return;

    setIsLocatingNearest(true);
    const userPoint = await getUserCoordinatesByBrowser();

    if (!userPoint) {
      setIsLocatingNearest(false);
      showToast(
        "Không lấy được vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.",
        "error",
      );
      return;
    }

    const nearestId = await findNearestBranchByPoint(
      branchAvailability,
      userPoint,
    );
    setIsLocatingNearest(false);

    if (!nearestId) {
      showToast("Không xác định được chi nhánh gần nhất.", "error");
      return;
    }

    setSelectedBranchId(nearestId);
    setNearestBranchId(nearestId);
    showToast("Đã chọn chi nhánh gần bạn nhất.", "success");
  };

  return {
    branchAvailability,
    isLoadingAvailability,
    selectedBranchId,
    nearestBranchId,
    isLocatingNearest,
    selectedBranch,
    setSelectedBranchId,
    handleUseCurrentLocation,
  };
};
