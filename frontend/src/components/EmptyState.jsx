function EmptyState({
    icon = '📭',
    title = 'No data found',
    description = 'There are no items to display at the moment.'
}) {
    return (
        <div className="empty-state">
            <div className="empty-state__icon">{icon}</div>
            <h3 className="empty-state__title">{title}</h3>
            <p className="empty-state__description">{description}</p>
        </div>
    );
}

export default EmptyState;
