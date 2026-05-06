import './AddFg.css';

export default function AddFg(){ 
  return (
    <div className="AddFg">
      <form>
        <input
          type="text"
          placeholder="food group name"
          name="food group"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
