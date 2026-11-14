import { useState, useEffect, useCallback } from "react";
import { boardService } from "../../../services/boardService";

function ShareDialog({ boardId, onClose, userRole: initialRole = "OWNER" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [owner, setOwner] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwner = currentUserRole === "OWNER";

  const fetchCollaborators = useCallback(async () => {
    if (!boardId) return;
    try {
      const data = await boardService.getBoardCollaborators(boardId);
      setOwner(data.owner);
      setCollaborators(data.collaborators || []);
      setInvitations(data.invitations || []);
      if (data.userRole) setCurrentUserRole(data.userRole);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await boardService.getBoardCollaborators(boardId);
        if (!ignore) {
          setOwner(data.owner);
          setCollaborators(data.collaborators || []);
          setInvitations(data.invitations || []);
          if (data.userRole) setCurrentUserRole(data.userRole);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load collaborators");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [boardId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = email.trim();

    if (!userEmail) {
      setError("Please enter an email address");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (owner && userEmail.toLowerCase() === owner.email.toLowerCase()) {
      setError("You already own this board");
      return;
    }

    const alreadyAdded = collaborators.some(
      (c) => c.email.toLowerCase() === userEmail.toLowerCase()
    );
    if (alreadyAdded) {
      setError("This person already has access to the board");
      return;
    }

    const alreadyInvited = invitations.some(
      (inv) => inv.email.toLowerCase() === userEmail.toLowerCase()
    );
    if (alreadyInvited) {
      setError("An invitation has already been sent to this email address");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await boardService.inviteCollaborator(boardId, {
        email: userEmail,
        role,
      });

      setSuccess(response.message || "Invitation sent successfully");
      setEmail("");
      setRole("EDITOR");
      await fetchCollaborators();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to invite user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (collaboratorId, newRole) => {
    try {
      await boardService.updateCollaboratorRole(boardId, collaboratorId, newRole);
      setCollaborators((prev) =>
        prev.map((c) => (c.id === collaboratorId ? { ...c, role: newRole } : c))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemove = async (collaboratorId) => {
    try {
      await boardService.removeCollaborator(boardId, collaboratorId);
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await boardService.cancelInvitation(boardId, invitationId);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel invitation");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
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
            className="text-xl text-neutral-500 hover:text-neutral-950 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {isOwner ? (
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
                setSuccess("");
              }}
              placeholder="Enter an email address"
              className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              disabled={isSubmitting}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-neutral-300 bg-white px-3 py-2 text-sm cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Inviting..." : "Invite"}
            </button>
          </form>
        ) : (
          <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
            Only the board owner can invite new collaborators.
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-2 text-sm text-emerald-600">
            {success}
          </p>
        )}

        <div className="mt-8">
          <h3 className="text-sm font-medium text-neutral-950">
            People with access
          </h3>

          {isLoading ? (
            <p className="mt-4 text-xs text-neutral-500">Loading collaborators...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {owner && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-950">
                      {owner.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {owner.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-950 text-white rounded">
                      OWNER
                    </span>
                  </div>
                </div>
              )}

              {collaborators.map((person) => (
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

                  <div className="flex items-center gap-3">
                    {isOwner ? (
                      <select
                        value={person.role}
                        onChange={(e) => handleRoleChange(person.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium border border-neutral-200 rounded cursor-pointer ${
                          person.role === "EDITOR"
                            ? "bg-orange-50 text-orange-800"
                            : "bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        <option value="EDITOR">EDITOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          person.role === "EDITOR"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {person.role}
                      </span>
                    )}

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemove(person.id)}
                        className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!owner && collaborators.length === 0 && (
                <p className="text-sm text-neutral-500">
                  No collaborators yet.
                </p>
              )}
            </div>
          )}
        </div>

        {invitations.length > 0 && (
          <div className="mt-6 border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-medium text-neutral-950">
              Pending Invitations
            </h3>
            <div className="mt-3 space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-neutral-800">{inv.email}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                      Pending ({inv.role})
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleCancelInvitation(inv.id)}
                      className="text-xs text-neutral-500 hover:text-red-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareDialog;
