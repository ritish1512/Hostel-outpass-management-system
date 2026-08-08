interface remarksType{
    isOpen:Boolean,
    value:string,
    onChange:(val:string)=>void,
    onCancel:()=>void,
    onConfirm:()=>void,
}

export const RemarksModel = ({isOpen,value,onChange,onCancel,onConfirm}:remarksType)=>{
    if(!isOpen)return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md p-6 bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                <h2 className="font-bold text-xl text-slate-900 mb-1">Reject Outpass Application</h2>
                <p className="text-sm text-slate-500 mb-4">Please provide an explicit reason explaining this request cancellation.</p>
                
                <div className="flex flex-col gap-4">
                  <input
                    name="remarks"
                    value={value ?? ""}
                    onChange={(e)=>onChange(e.target.value)}
                    type="text"
                    maxLength={50}
                    placeholder="Type reason here (max 50 chars)..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-sm text-slate-800"
                    autoFocus
                  />

                  {/* Modal Action Buttons CONTAINER FIXED */}
                  <div className="flex gap-3 justify-end mt-2">
                    <button
                      type="button"
                      onClick={(e) =>{e.preventDefault(); onCancel()}}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      disabled={!value.trim()}
                      onClick={(e) => {
                        e.preventDefault();
                        onConfirm;
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all shadow-sm"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            </div>)
}