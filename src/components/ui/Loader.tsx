import { Loader } from "lucide-react";
export function Loading(){
    return(
        <div className="fixed top-[50%] left-[50%]">
            <Loader className="animate-spin"/>
        </div>
    )
}