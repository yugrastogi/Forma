import { useState } from "react";
import collaborators from "../data/collaborators";

function ShareDialog({ onClose }) {
    const [email, setEmail] = useState("");
    const [people, setPeople] = useState(collaborators);
    const [role, setRole] = useState("EDITOR");
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        const userEmail = email.trim();

        if (!userEmail) {
            setError("Please enter an email address");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (userEmail.toLowerCase() === "yogyeberry@gmail.com") { //i did this for testing change the email id here ifyou want to test in your local machine
            setError("You already own this board");
            return;
        }

        if (!emailPattern.test(userEmail)) {
            setError("Please enter a valid email address");
            return;
        }
        const alreadyAdded = people.some(
            (person) => person.email.toLowerCase() === userEmail.toLowerCase()
        );

        if (alreadyAdded) {
            setError("This person already has access to the board");
            return;
        }

        setError("");

        const newPerson = {
            id: Date.now(),
            name: userEmail.split("@")[0],
            email: userEmail,
            role: role,
        };

        setPeople([...people, newPerson]);

        setEmail("");
        setRole("EDITOR");
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Share your board
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Invite people to collaborate with you.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="text-xl text-neutral-500 hover:text-neutral-950"
                    >
                        &times;
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                        placeholder="Enter an email address"
                        className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border border-neutral-300 bg-white px-3 py-2 text-sm"
                    >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                    </select>

                    <button
                        type="submit"
                        className="bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        Invite
                    </button>
                </form>

                {error && (
                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>
                )}
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-neutral-950">
                        People with access
                    </h3>

                    <div className="mt-4 space-y-4">
                        {people.map((person) => (
                            <div
                                key={person.id}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-neutral-950">
                                        {person.name}
                                    </p>

                                    <p className="text-xs text-neutral-500">
                                        {person.email}
                                    </p>
                                </div>

                                <span
                                    className={`px-2 py-1 text-xs font-medium ${person.role === "OWNER"
                                            ? "bg-neutral-950 text-white"
                                            : person.role === "EDITOR"
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-neutral-100 text-neutral-600"
                                        }`}
                                >
                                    {person.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ShareDialog;