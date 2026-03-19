import StatCard from "./StatCard";
import "./StatGroup.css";
export default function StatGroup({ title, items }) {

  return (
    <div className="stat-group">

      <h3><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F19E39"><path d="m288-96 144-288-288-48 456-432h72L528-576l288 48L360-96h-72Zm182-204 191-180-241-41 70-139-191 181 241 40-70 139Zm10-180Z"/></svg> {title}</h3>

      <div className="card-container">

        {items.map((item, i) => (
          <StatCard key={i} {...item}/>
        ))}

      </div>

    </div>
  );
}