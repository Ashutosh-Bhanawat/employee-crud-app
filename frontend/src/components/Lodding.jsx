const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                <p className="text-lg text-gray-700 font-medium">Loading, please wait...</p>
            </div>
        </div>
    );
};

export default Loading;
