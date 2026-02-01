function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading the data. Please try again.',
    onRetry
}) {
    return (
        <div className="error-state">
            <div className="error-state__icon">⚠️</div>
            <h3 className="error-state__title">{title}</h3>
            <p className="error-state__description">{message}</p>
            {onRetry && (
                <button className="btn btn--primary" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorState;
