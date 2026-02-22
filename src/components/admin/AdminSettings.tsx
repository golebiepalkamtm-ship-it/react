import React from "react";
import { Settings, Server, AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#0A0F1C]/50 border border-[#A68E4E]/20 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#A68E4E]" />
          Ustawienia platformy
        </h3>
        <div className="space-y-4">
          {[
            {
              title: "Rejestracja użytkowników",
              desc: "Zezwól na rejestrację nowych użytkowników",
              default: true,
            },
            {
              title: "Weryfikacja email",
              desc: "Wymagaj weryfikacji email przed licytacją",
              default: true,
            },
            {
              title: "Powiadomienia push",
              desc: "Włącz powiadomienia push dla użytkowników",
              default: true,
            },
            {
              title: "Tryb konserwacji",
              desc: "Wyłącz dostęp do platformy dla użytkowników",
              default: false,
            },
          ].map((setting, index) => (
            <div
              key={setting.title}
              className="flex items-center justify-between p-4 rounded-xl bg-[#A68E4E]/5 hover:bg-[#A68E4E]/10 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{setting.title}</p>
                <p className="text-xs text-[#A68E4E]/60">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.default}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#A68E4E]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A68E4E]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0A0F1C]/50 border border-[#A68E4E]/20 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#A68E4E]" />
          Status systemu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Baza danych", status: "online", color: "green" },
            { label: "API Server", status: "online", color: "green" },
            { label: "Storage", status: "online", color: "green" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-[#A68E4E]/5 flex items-center justify-between"
            >
              <span className="text-sm text-[#A68E4E]/80">{item.label}</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full bg-green-400 animate-pulse`}
                />
                <span className={`text-xs text-green-400`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-900/10 border border-red-500/20">
        <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#A68E4E]" />
          Strefa niebezpieczna
        </h3>
        <p className="text-sm text-red-300/70 mb-4">
          Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Wyczyść cache
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Resetuj statystyki
          </Button>
        </div>
      </div>
    </div>
  );
};
