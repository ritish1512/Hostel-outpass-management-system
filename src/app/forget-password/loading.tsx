export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                <div className="mb-6 h-8 w-3/4 rounded bg-gray-200" />
                <div className="space-y-4">
                    <div className="h-10 rounded bg-gray-200" />
                    <div className="h-10 rounded bg-gray-200" />
                </div>
            </div>
        </div>
    );
}