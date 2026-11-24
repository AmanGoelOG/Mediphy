import { Link } from "react-router-dom";
function PharmacyCard({ pharmacy }) {
  return (
    <div className="item-card">
      <div className="medicine-icon">✚</div>
      <h3>{pharmacy.name}</h3>
      <p>{pharmacy.address}</p>
      <p>Distance: {pharmacy.distance}</p>
      <Link to={`/pharmacies/${pharmacy._id}`} className="card-link">
        View Pharmacy →
      </Link>
    </div>
  );
}
export default PharmacyCard;
