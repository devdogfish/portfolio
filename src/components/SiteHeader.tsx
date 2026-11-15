import {articles,WritingPreview} from './ActivityWidgets';
import { useEffect, useState } from "react";
import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Command,
  CommandDialog,
  CommandDialogPortal,
  CommandDialogBackdrop,
  CommandDialogViewport,
  CommandDialogPopup,
  CommandInput,
  CommandPanel,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandItem,
  CommandFooter,
  DialogTitle,
} from "@atom63/ui-react";
import {
  AppearanceMenu,
  createPersonalizationController,
} from "@atom63/ui-react/theme";
import { GridRule } from "@atom63/ui-react/layout";
import {
  Grid2X2,
  Orbit,
  House,
  Route,
  FileText,
  ExternalLink,
  Mail,
  Settings,
  Eye,
} from "lucide-react";
import { WidgetExhibit } from "./WidgetExhibit";
import "./site-header.css";
export const { PersonalizationProvider, usePersonalization } =
  createPersonalizationController({
    storageKey: "portfolio-appearance",
    defaultState: {
      mode: "dark",
      theme: "retro",
      brand: "b1",
      surface: "n1",
      surfaceTint: 35,
      typeScale: "normal",
      radius: "default",
      font: "sans",
      os: "macos",
      iconTheme: "neutral",
      wallpaper: null,
    },
  });
const destinations = [
  { group: "Navigate", label: "Index", href: "#top", icon: House },
  {
    group: "Navigate",
    label: "Timeline",
    href: "https://atom63.io/timeline",
    icon: Route,
  },
  { group: "Navigate", label: "Writing", href: "#activity", icon: FileText },
  {
    group: "Navigate",
    label: "Resume",
    href: "https://resume.atom63.io",
    icon: FileText,
  },
  {
    group: "Navigate",
    label: "OS63",
    href: "https://os.atom63.io/",
    icon: ExternalLink,
  },
  {
    group: "Navigate",
    label: "Design System",
    href: "https://system.atom63.io/",
    icon: ExternalLink,
  },
  ...(
    [
      "Copy email",
      "Behance",
      "Instagram",
      "LinkedIn",
      "GitHub",
      "X.com",
      "ADPList",
      "Xiaohongshu",
    ] as const
  ).map((label, i) => ({
    group: "Elsewhere",
    label,
    href: [
      "email",
      "https://www.behance.net/youzhang",
      "https://www.instagram.com/atom63_/",
      "https://www.linkedin.com/in/you-zhang/",
      "https://github.com/atom63",
      "https://x.com/atom63_",
      "https://adplist.org/mentors/you-zhang",
      "https://xhslink.com/m/5g7zBl3gPfN",
    ][i],
    icon: label === "Copy email" ? Mail : ExternalLink,
  })),
  {
    group: "Actions",
    label: "Preferences",
    href: "preferences",
    icon: Settings,
  },
];
export function SiteHeader({ email }: { email: string }) {
  const controller = usePersonalization();
  const [preferences, setPreferences] = useState(false);
  const [widgets, setWidgets] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [writing,setWriting]=useState<number|null>(null);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenu((v) => !v);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (!menu) {
      setSearch("");
      setCopied(false);
    }
  }, [menu]);
  const searchEntries = search.trim() ? [...destinations, ...articles.map((a,i)=>({group:"Writing",label:a[2],href:`writing:${i}`,icon:FileText})), ...["Windows Insider Program","Microsoft’s 50th Anniversary","Windows App","Ribbon","Brushed","Curvy","WIP11"].map((label,i)=>({group:"Projects",label,href:`gallery:${i}`,icon:Eye}))] : destinations;
  const filtered = searchEntries.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()),
  );
  async function select(item: (typeof destinations)[number]) {
    if (item.href === "email") {
      try {
        await navigator.clipboard.writeText(email);
        setCopied(true);
      } catch {
        window.location.href = `mailto:${email}`;
      }
      return;
    }
    setMenu(false);
    if (item.href === "preferences") setPreferences(true);
    else if(item.href.startsWith("writing:"))setWriting(Number(item.href.split(":")[1]));
    else if(item.href.startsWith("gallery:"))window.dispatchEvent(new CustomEvent("portfolio:gallery",{detail:Number(item.href.split(":")[1])}));
    else if (item.href.startsWith("#"))
      document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
    else window.open(item.href, "_blank", "noopener,noreferrer");
  }
  return (
    <>
      <header className="site-header">
        <GridRule bleed />
        <div className="header-inner">
          <a className="home-link" href="#top" aria-label="Home">
            <img src="/assets/home-atom63.png" alt="" />
            <span className="slash">/</span>
            <span>Index</span>
          </a>
          <div className="header-actions">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="header-control"
                    aria-label="Open widgets"
                    onClick={() => setWidgets(true)}
                  />
                }
              >
                <Grid2X2 />
              </TooltipTrigger>
              <TooltipContent side="bottom">Widgets</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="header-control"
                    aria-label="Open preferences"
                    aria-expanded={preferences}
                    aria-haspopup="dialog"
                    data-site-config-trigger=""
                    onClick={() => setPreferences((v) => !v)}
                  />
                }
              >
                <Orbit />
              </TooltipTrigger>
              <TooltipContent side="bottom">Preferences　⌘,</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="sm"
                    variant="ghost"
                    className="header-control menu-button"
                    aria-label="Open site menu"
                    onClick={() => setMenu(true)}
                  />
                }
              >
                Menu <kbd>⌘K</kbd>
              </TooltipTrigger>
              <TooltipContent side="bottom">Menu　⌘K</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <GridRule bleed />
      </header>
      <AppearanceMenu
        ignoreOutsideSelector="[data-site-config-trigger]"
        controller={controller}
        open={preferences}
        onOpenChange={setPreferences}
        showTrigger={false}
        title="Preferences"
        closeLabel="Close preferences"
        description="Adjust the site surface, accent, type, and interaction feel."
        resetLabel="Reset all"
      />
      <WidgetExhibit open={widgets} onOpenChange={setWidgets} />
      <WritingPreview index={writing??0} open={writing!==null} onChange={setWriting} onClose={()=>setWriting(null)}/>
      <CommandDialog
        open={menu}
        onOpenChange={(open) => {
          setMenu(open);
          if (!open) {
            setSearch("");
            setCopied(false);
          }
        }}
      >
        <CommandDialogPortal>
          <CommandDialogBackdrop />
          <CommandDialogViewport>
            <CommandDialogPopup className="parity-command" finalFocus={false}>
              <DialogTitle className="sr-only">Site menu</DialogTitle>
              <Command
                items={filtered}
                itemToStringValue={(item) =>
                  (item as (typeof destinations)[number]).label
                }
                value={search}
                onValueChange={setSearch}
                filter={null}
              >
                <CommandInput placeholder="Search…" aria-label="Search site" />
                <CommandPanel>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandList>
                    {["Navigate", "Projects", "Writing", "Elsewhere", "Actions"].map((group) => (
                      <CommandGroup key={group}>
                        <CommandGroupLabel>{group}</CommandGroupLabel>
                        {filtered
                          .filter((i) => i.group === group)
                          .map((item) => (
                            <CommandItem
                              key={item.label}
                              value={item}
                              onClick={() => select(item)}
                            >
                              <item.icon size={16} />
                              <span className="command-label">
                                {item.label === "Copy email" && copied
                                  ? "Copied"
                                  : item.label}
                              </span>
                              {item.href === "preferences" ? (
                                <kbd>⌘+,</kbd>
                              ) : item.href.startsWith("#") ? (
                                <Eye size={14} />
                              ) : item.href !== "email" ? (
                                <ExternalLink size={14} />
                              ) : null}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </CommandPanel>
                <CommandFooter>
                  <span>
                    <kbd>↑↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd>↵</kbd> Select
                  </span>
                </CommandFooter>
              </Command>
            </CommandDialogPopup>
          </CommandDialogViewport>
        </CommandDialogPortal>
      </CommandDialog>
    </>
  );
}
