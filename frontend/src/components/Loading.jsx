function Loading({ message = 'Loading...' }) {
    return (
        <div className="loading">
            <div className="loading__spinner"></div>
            <p className="loading__text">{message}</p>
        </div>
    );
}

export default Loading;
