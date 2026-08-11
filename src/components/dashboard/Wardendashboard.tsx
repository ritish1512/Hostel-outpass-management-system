import dashboardProps from "@/types/dashboard";

export default function Wardendashboard({outpasses}:dashboardProps){
  
  return(<div>
    <div>

    </div>
    <div>{outpasses.map((pass)=>{
      return(
      <div key={pass.id}>
        <h2>{pass.student.name}</h2>
        <h2>{pass.student.HostelRoomNo}</h2>
        <button type="button" >Approve</button>
      </div>
  )})}
    </div>
  </div>);
}