import { Link } from "react-router-dom";
function MedicineCard({ medicine }) {
  return (
    <div className="item-card">
      <div className="medicine-icon">✚</div>
      <h3>{medicine.name}</h3>
      <p>{medicine.strength}</p>
      <span className="category">{medicine.category}</span>
      <Link to={`/medicines/${medicine._id}`} className="card-link">
        View Details →
      </Link>
    </div>
  );
}
export default MedicineCard;
