interface SectionTagProps {
    title: string;
}

const SectionTag = (props: SectionTagProps) => {
    const sectionId = `${props.title.toLowerCase().replace(/\s+/g, '-')}-section-title`;
    
    return (
        <div className="flex flex-row gap-2 items-center">
            <div className="w-[20px] h-[40px] rounded-sm bg-secondary2" aria-hidden="true"/>
            <h2 id={sectionId} className="text-base text-secondary2 font-semibold">{props.title}</h2>
        </div>
    );
}

export default SectionTag;