interface IRejectionString{
    isOpen:Boolean,
    value:string,
    onChange:(val:string)=>void,
    onCancel:()=>void,
    onConfirm:()=>void
}

export default function RejectionString({isOpen,value,onChange,onCancel,onConfirm}:IRejectionString){
    if(!isOpen)return null;
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl border border-gray-100">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Type REJECT to reject multiple outpasses
              </h2>
              
              <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="REJECT"
              />
              
              <div className="mt-5 flex justify-center gap-3">
                <button 
                  type="button" 
                  onClick={() => onCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => onConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
    )
}