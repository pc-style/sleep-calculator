"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { themes } from "@/lib/themes";
import { languages } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";
import { AnimatedComponent } from "@/components/animated-component";
import { scaleUp, fadeIn, slideUp } from "@/lib/animations";

export function Settings() {
  const { theme, setTheme, language, setLanguage, timeFormat, setTimeFormat, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for settings before saving
  const [localTheme, setLocalTheme] = useState(theme.id);
  const [localLanguage, setLocalLanguage] = useState(language.id);
  const [localTimeFormat, setLocalTimeFormat] = useState(timeFormat);

  // Reset local state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalTheme(theme.id);
      setLocalLanguage(language.id);
      setLocalTimeFormat(timeFormat);
    }
    setIsOpen(open);
  };

  // Save settings
  const handleSave = () => {
    const newTheme = themes.find(t => t.id === localTheme);
    if (newTheme) setTheme(newTheme);
    
    const newLanguage = languages.find(l => l.id === localLanguage);
    if (newLanguage) setLanguage(newLanguage);
    
    setTimeFormat(localTimeFormat);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-4 right-4 z-50"
          style={{ cursor: 'pointer' }}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsIcon className="h-4 w-4" />
          </motion.div>
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>
                  <AnimatedComponent animation={fadeIn}>
                    {t("settings.title")}
                  </AnimatedComponent>
                </DialogTitle>
                <DialogDescription asChild>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    {t("settings.description")}
                  </motion.span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <AnimatedComponent animation={slideUp} delay={0.2} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme" className="col-span-1">
                    {t("settings.theme.label")}
                  </Label>
                  <Select
                    value={localTheme}
                    onValueChange={setLocalTheme}
                  >
                    <SelectTrigger className="col-span-3" id="theme">
                      <SelectValue placeholder={t("settings.theme.label")} />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <motion.div
                          key={theme.id}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <SelectItem value={theme.id}>
                            {theme.name}
                          </SelectItem>
                        </motion.div>
                      ))}
                    </SelectContent>
                  </Select>
                </AnimatedComponent>
                <AnimatedComponent animation={slideUp} delay={0.3} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="language" className="col-span-1">
                    {t("settings.language.label")}
                  </Label>
                  <Select
                    value={localLanguage}
                    onValueChange={setLocalLanguage}
                  >
                    <SelectTrigger className="col-span-3" id="language">
                      <SelectValue placeholder={t("settings.language.label")} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <motion.div
                          key={lang.id}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <SelectItem value={lang.id}>
                            {lang.nativeName}
                          </SelectItem>
                        </motion.div>
                      ))}
                    </SelectContent>
                  </Select>
                </AnimatedComponent>
                <AnimatedComponent animation={slideUp} delay={0.4} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeFormat" className="col-span-1">
                    {t("settings.timeFormat.label")}
                  </Label>
                  <Select
                    value={localTimeFormat}
                    onValueChange={(value: "12h" | "24h") => setLocalTimeFormat(value)}
                  >
                    <SelectTrigger className="col-span-3" id="timeFormat">
                      <SelectValue placeholder={t("settings.timeFormat.label")} />
                    </SelectTrigger>
                    <SelectContent>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <SelectItem value="24h">{t("settings.timeFormat.24h")}</SelectItem>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <SelectItem value="12h">{t("settings.timeFormat.12h")}</SelectItem>
                      </motion.div>
                    </SelectContent>
                  </Select>
                </AnimatedComponent>
              </div>
              <DialogFooter>
                <AnimatedComponent animation={scaleUp} delay={0.5}>
                  <Button type="submit" onClick={handleSave}>
                    {t("settings.save")}
                  </Button>
                </AnimatedComponent>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
