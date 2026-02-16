import React from "react";
import { motion } from "framer-motion";
import { Plus, Edit, UserCheck, CheckCircle, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/admin";

interface AdminUsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onAction: (
    userId: string,
    action: "ban" | "unban" | "delete" | "verify",
  ) => void;
  onAdd: () => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onEdit,
  onAction,
  onAdd,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/60 text-sm">
          Znaleziono {users.length} użytkowników
        </p>
        <Button
          onClick={onAdd}
          className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold gap-2 shadow-lg shadow-gold/20"
        >
          <Plus className="w-4 h-4" /> Dodaj Użytkownika
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">
                Użytkownik
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">
                Email
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">
                Nick
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">
                Data rejestracji
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-white/70">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20">
                      <span className="text-gold text-sm font-medium">
                        {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-white">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-white/60">
                  {user.email}
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                    {user.username || "Brak nicku"}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-white/60">
                  {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors"
                      onClick={() => onEdit(user)}
                      title="Edytuj dane użytkownika"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors"
                      onClick={() => onAction(user.id, "verify")}
                      title="Zweryfikuj konto użytkownika"
                    >
                      <UserCheck className="w-4 h-4 text-green-400" />
                    </button>
                    {user.role === "BANNED" ? (
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors"
                        onClick={() => onAction(user.id, "unban")}
                        title="Odblokuj użytkownika"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </button>
                    ) : (
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 transition-colors"
                        onClick={() => onAction(user.id, "ban")}
                        title="Zablokuj użytkownika (Ban)"
                      >
                        <Ban className="w-4 h-4 text-orange-400" />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                      onClick={() => onAction(user.id, "delete")}
                      title="Usuń trwale użytkownika"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
