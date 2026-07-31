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
        <p className="text-zinc-300 text-sm font-medium">
          Znaleziono <span className="text-[#A68E4E] font-bold">{users.length}</span> użytkowników
        </p>
        <Button
          onClick={onAdd}
          className="bg-[#A68E4E] text-[#0A0F1C] hover:bg-gold font-bold gap-2 shadow-lg shadow-[#A68E4E]/30"
        >
          <Plus className="w-4 h-4" /> Dodaj Użytkownika
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#A68E4E]/40 bg-[#060a17]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#A68E4E]/30 bg-[#0d162b]">
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Użytkownik
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Email
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Nick
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Data rejestracji
              </th>
              <th className="text-right py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                className="border-b border-[#A68E4E]/15 hover:bg-[#A68E4E]/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A68E4E]/40 to-[#A68E4E]/20 flex items-center justify-center border border-[#A68E4E]/50">
                      <span className="text-[#A68E4E] text-sm font-bold">
                        {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-zinc-200">
                  {user.email}
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#A68E4E]/20 text-gold border border-[#A68E4E]/30">
                    {user.username || "Brak nicku"}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-zinc-300">
                  {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 rounded-lg bg-[#A68E4E]/10 border border-[#A68E4E]/20 hover:bg-[#A68E4E]/30 transition-colors"
                      onClick={() => onEdit(user)}
                      title="Edytuj dane użytkownika"
                    >
                      <Edit className="w-4 h-4 text-[#A68E4E]" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-[#A68E4E]/20 transition-colors"
                      onClick={() => onAction(user.id, "verify")}
                      title="Zweryfikuj konto użytkownika"
                    >
                      <UserCheck className="w-4 h-4 text-[#A68E4E]" />
                    </button>
                    {user.isBanned ? (
                      <button
                        className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-[#A68E4E]/20 transition-colors"
                        onClick={() => onAction(user.id, "unban")}
                        title="Odblokuj użytkownika"
                      >
                        <CheckCircle className="w-4 h-4 text-[#A68E4E]" />
                      </button>
                    ) : (
                      <button
                        className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-[#A68E4E]/20 transition-colors"
                        onClick={() => onAction(user.id, "ban")}
                        title="Zablokuj użytkownika (Ban)"
                      >
                        <Ban className="w-4 h-4 text-[#A68E4E]" />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-red-500/20 transition-colors"
                      onClick={() => onAction(user.id, "delete")}
                      title="Usuń trwale użytkownika"
                    >
                      <Trash2 className="w-4 h-4 text-[#A68E4E] hover:text-red-400 transition-colors" />
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
