import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Phone, Plus, Trash2, ChevronLeft } from "lucide-react";

export default function FamilySupport() {
  const navigate = useNavigate();

  const [family, setFamily] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    phone: "",
  });

  /* =========================
     LOAD DATA
  ========================== */
  useEffect(() => {
    const saved = localStorage.getItem("family");
    if (saved) setFamily(JSON.parse(saved));
    else {
      setFamily([
        { name: "Reenish Kumar", relation: "Son", phone: "9876543211" },
        { name: "Lakshmi", relation: "Daughter", phone: "9876543212" },
      ]);
    }
  }, []);

  const saveFamily = (data: any[]) => {
    setFamily(data);
    localStorage.setItem("family", JSON.stringify(data));
  };

  /* =========================
     ADD MEMBER
  ========================== */
  const addMember = () => {
    if (!newMember.name || !newMember.phone) {
      alert("Fill all fields");
      return;
    }

    const updated = [...family, newMember];
    saveFamily(updated);

    setNewMember({ name: "", relation: "", phone: "" });
    setShowForm(false);
  };

  /* =========================
     DELETE MEMBER
  ========================== */
  const deleteMember = (index: number) => {
    const updated = family.filter((_, i) => i !== index);
    saveFamily(updated);
  };

  /* =========================
     CALL
  ========================== */
  const callMember = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  /* =========================
     SOS ALERT
  ========================== */
  const sendSOS = () => {
    alert("🚨 SOS sent to all family members!");

    family.forEach((m) => {
      console.log(`Sending SOS to ${m.name} (${m.phone})`);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
        >
          <ChevronLeft />
        </button>
        <h1 className="text-2xl font-bold">Family Support</h1>
      </div>

      {/* FAMILY LIST */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        {family.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-5 py-4 border-b"
          >
            <div className="flex items-center gap-3">
              <Users className="text-blue-500" />

              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">
                  {member.relation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => callMember(member.phone)}>
                <Phone className="text-green-500" />
              </button>

              <button onClick={() => deleteMember(index)}>
                <Trash2 className="text-red-500" />
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <Plus /> Add Family Member
      </button>

      {/* SOS BUTTON */}
      <button
        onClick={sendSOS}
        className="mt-3 w-full bg-red-600 text-white py-3 rounded-xl font-bold"
      >
        🚨 Send SOS to Family
      </button>

      {/* ADD FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-4">
              Add Family Member
            </h2>

            <input
              placeholder="Name"
              className="w-full border p-2 mb-2 rounded"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />

            <input
              placeholder="Relation"
              className="w-full border p-2 mb-2 rounded"
              value={newMember.relation}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  relation: e.target.value,
                })
              }
            />

            <input
              placeholder="Phone"
              className="w-full border p-2 mb-4 rounded"
              value={newMember.phone}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  phone: e.target.value,
                })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={addMember}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}