import React, { useState, useEffect } from "react";
import {
  Home, Wallet, BarChart3, Settings, ArrowDownLeft, ArrowUpRight,
  ChevronLeft, ChevronRight, X, Check, Loader2, Copy, Search,
  Monitor, Smartphone, Building2, Plus, MoreHorizontal
} from "lucide-react";

// ---------- Mock data ----------
const WALLETS = [
  { id: "metamask", name: "MetaMask", color: "#F6851B", letter: "M", installed: true, type: "browser" },
  { id: "phantom", name: "Phantom", color: "#AB9FF2", letter: "P", installed: false, type: "mobile" },
  { id: "coinbase", name: "Coinbase Wallet", color: "#0052FF", letter: "C", installed: true, type: "browser" },
  { id: "trust", name: "Trust Wallet", color: "#3375BB", letter: "T", installed: false, type: "mobile" },
  { id: "rainbow", name: "Rainbow", color: "#001E59", letter: "R", installed: false, type: "mobile" },
  { id: "ledger", name: "Ledger Live", color: "#1a1a1a", letter: "L", installed: false, type: "hardware" },
];

const INITIAL_ACTIVITY = [
  { type: "trade", label: "Bought SOL", sub: "with USDC", amount: "+2.10 SOL", value: "−$353.68", time: "2h ago", positive: true },
  { type: "deposit", label: "Deposit", sub: "from wallet", amount: "+$500.00", value: "+$500.00", time: "1d ago", positive: true },
  { type: "trade", label: "Sold ETH", sub: "for USDT", amount: "−0.12 ETH", value: "+$410.42", time: "3d ago", positive: false },
];

// ---------- App ----------
export default function App() {
  const [device, setDevice] = useState("desktop"); // 'desktop' | 'mobile'
  const [balance, setBalance] = useState(2845.32);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);

  // Deposit flow state
  const [depositOpen, setDepositOpen] = useState(false);
  const [step, setStep] = useState("amount"); // amount | wallet-picker | signing | complete
  const [amount, setAmount] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [method, setMethod] = useState("wallet"); // 'wallet' | 'bank'

  const reset = () => {
    setStep("amount");
    setAmount("");
    setSelectedWallet(null);
    setMethod("wallet");
  };

  const openDeposit = () => { reset(); setDepositOpen(true); };
  const closeDeposit = () => { setDepositOpen(false); setTimeout(reset, 300); };

  const handleContinue = () => setStep("wallet-picker");

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
    // Desktop: browser wallet → signing screen; mobile wallet → keep QR visible (highlighted)
    // Mobile: any wallet → deeplink → signing
    if (device === "mobile" || (device === "desktop" && wallet.installed)) {
      setStep("signing");
      // Simulate signing → confirmation
      setTimeout(() => {
        const amt = parseFloat(amount) || 0;
        setBalance(prev => prev + amt);
        setActivity(prev => [
          { type: "deposit", label: "Deposit", sub: `via ${wallet.name}`, amount: `+$${amt.toFixed(2)}`, value: `+$${amt.toFixed(2)}`, time: "Just now", positive: true },
          ...prev,
        ]);
        setStep("complete");
      }, 2400);
    }
    // Desktop + mobile wallet selected: stay on wallet-picker, QR highlights for that wallet (handled in render)
  };

  const handleQRScan = () => {
    // Simulates user scanning QR on desktop with their phone
    setStep("signing");
    setSelectedWallet(selectedWallet || { name: "your wallet", color: "#3396FF", letter: "W" });
    setTimeout(() => {
      const amt = parseFloat(amount) || 0;
      setBalance(prev => prev + amt);
      setActivity(prev => [
        { type: "deposit", label: "Deposit", sub: "via WalletConnect Pay", amount: `+$${amt.toFixed(2)}`, value: `+$${amt.toFixed(2)}`, time: "Just now", positive: true },
        ...prev,
      ]);
      setStep("complete");
    }, 2400);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#f4f4f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif&display=swap');
        :root {
          --bg: #f4f4f0;
          --surface: #ffffff;
          --surface-2: #faf9f5;
          --surface-3: #f0efe9;
          --border: #e8e6df;
          --border-2: #d8d6cf;
          --text: #0a0a0a;
          --text-dim: #6b6b66;
          --text-dimmer: #a3a39c;
          --accent: #3396ff;
          --accent-soft: #3396ff14;
          --accent-hover: #2580e6;
          --success: #16a34a;
          --success-soft: #16a34a14;
          --danger: #dc2626;
        }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes successPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .fade-in { animation: fadeIn 0.3s ease both; }
        .slide-up { animation: slideUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .scale-in { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .qr-cell { transition: background 0.3s ease; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Header / device toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dimmer)" }}>WalletConnect Pay · Demo</div>
            <h1 className="serif text-[36px] leading-tight mt-1" style={{ color: "var(--text)" }}>Deposit flow prototype</h1>
          </div>
          <DeviceToggle device={device} setDevice={(d) => { setDevice(d); closeDeposit(); }} />
        </div>

        {/* Frames */}
        <div className="flex justify-center items-start">
          {device === "desktop" ? (
            <DesktopFrame
              balance={balance}
              activity={activity}
              depositOpen={depositOpen}
              step={step}
              amount={amount}
              setAmount={setAmount}
              method={method}
              setMethod={setMethod}
              selectedWallet={selectedWallet}
              onOpenDeposit={openDeposit}
              onCloseDeposit={closeDeposit}
              onContinue={handleContinue}
              onWalletSelect={handleWalletSelect}
              onQRScan={handleQRScan}
              onComplete={() => { closeDeposit(); }}
            />
          ) : (
            <MobileFrame
              balance={balance}
              activity={activity}
              depositOpen={depositOpen}
              step={step}
              amount={amount}
              setAmount={setAmount}
              method={method}
              setMethod={setMethod}
              selectedWallet={selectedWallet}
              onOpenDeposit={openDeposit}
              onCloseDeposit={closeDeposit}
              onContinue={handleContinue}
              onWalletSelect={handleWalletSelect}
              onComplete={() => { closeDeposit(); }}
            />
          )}
        </div>

        {/* Demo hint */}
        <div className="text-center mt-10 mono text-[11px] tracking-wide" style={{ color: "var(--text-dimmer)" }}>
          {device === "desktop"
            ? "tap a browser wallet to sign in extension · tap a mobile wallet to highlight QR · tap the QR to simulate a phone scan"
            : "tap any wallet to open the deeplink"}
        </div>
      </div>
    </div>
  );
}

// ---------- Device toggle ----------
function DeviceToggle({ device, setDevice }) {
  return (
    <div className="inline-flex p-1 rounded-full" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {[
        { id: "desktop", label: "Desktop", icon: <Monitor size={14} /> },
        { id: "mobile", label: "Mobile", icon: <Smartphone size={14} /> },
      ].map(opt => (
        <button
          key={opt.id}
          onClick={() => setDevice(opt.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all"
          style={{
            background: device === opt.id ? "var(--text)" : "transparent",
            color: device === opt.id ? "var(--surface)" : "var(--text-dim)",
          }}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ========================================================================
// DESKTOP
// ========================================================================
function DesktopFrame(props) {
  const { balance, activity, depositOpen, onOpenDeposit, onCloseDeposit } = props;

  return (
    <div className="w-full max-w-[1180px] rounded-2xl overflow-hidden relative" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.12)" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--surface-3)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-md mono text-[11px] flex items-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-dim)", minWidth: 320 }}>
            <span style={{ color: "var(--success)" }}>●</span>
            app.tradedemo.com
          </div>
        </div>
        <div style={{ width: 50 }} />
      </div>

      {/* App layout */}
      <div className="flex" style={{ height: 680 }}>
        {/* Sidebar */}
        <div className="flex flex-col py-6 px-4" style={{ width: 220, borderRight: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <div className="flex items-center gap-2 px-3 mb-10">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--text)" }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--accent)" }} />
            </div>
            <span className="font-semibold text-[14px]">Tradedemo</span>
          </div>

          <nav className="flex flex-col gap-1">
            <SidebarItem icon={<Home size={16} />} label="Home" active />
            <SidebarItem icon={<BarChart3 size={16} />} label="Trade" />
            <SidebarItem icon={<Wallet size={16} />} label="Balance" />
            <SidebarItem icon={<ArrowUpRight size={16} />} label="Earn" />
            <SidebarItem icon={<Settings size={16} />} label="Settings" />
          </nav>

          <div className="mt-auto flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "var(--surface)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium" style={{ background: "linear-gradient(135deg, #3396ff, #6c2bd9)", color: "white" }}>M</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate">Mirna</div>
              <div className="mono text-[10px] truncate" style={{ color: "var(--text-dimmer)" }}>mirna@reown.com</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-10 py-10 overflow-y-auto">
          <DesktopHome balance={balance} activity={activity} onDeposit={onOpenDeposit} />
        </div>
      </div>

      {/* Deposit modal */}
      {depositOpen && (
        <DesktopDepositModal {...props} onClose={onCloseDeposit} />
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <button
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text)" : "var(--text-dim)",
        fontWeight: active ? 500 : 400,
        border: active ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function DesktopHome({ balance, activity, onDeposit }) {
  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dimmer)" }}>Welcome back</div>
          <h1 className="serif text-[32px] leading-none mt-2">Good afternoon, Mirna</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Hero balance card */}
        <div className="col-span-2 p-8 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="mono text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-dimmer)" }}>Portfolio value</div>
          <div className="serif leading-none mb-6" style={{ fontSize: 72, letterSpacing: "-0.02em" }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onDeposit}
              className="px-6 py-3 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "var(--text)", color: "var(--surface)" }}
            >
              <ArrowDownLeft size={16} /> Deposit
            </button>
            <button className="px-6 py-3 rounded-full text-[14px] font-medium flex items-center gap-2" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
              <ArrowUpRight size={16} /> Withdraw
            </button>
            <button className="px-6 py-3 rounded-full text-[14px] font-medium flex items-center gap-2" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
              <BarChart3 size={16} /> Trade
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="mono text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: "var(--text-dimmer)" }}>Open positions</div>
            <div className="serif text-[28px] leading-none">7</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="mono text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: "var(--text-dimmer)" }}>This month</div>
            <div className="serif text-[28px] leading-none" style={{ color: "var(--success)" }}>+$284</div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium">Recent activity</h3>
          <button className="mono text-[11px] flex items-center gap-1" style={{ color: "var(--text-dim)" }}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          {activity.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: i < Math.min(activity.length, 5) - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: a.type === "deposit" ? "var(--success-soft)" : "var(--surface-3)" }}>
                  {a.type === "deposit" ? <ArrowDownLeft size={14} style={{ color: "var(--success)" }} /> : <BarChart3 size={14} style={{ color: "var(--text-dim)" }} />}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{a.label}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-dimmer)" }}>{a.sub} · {a.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-[13px]">{a.amount}</div>
                <div className="mono text-[10px]" style={{ color: a.positive ? "var(--success)" : "var(--text-dim)" }}>{a.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopDepositModal(props) {
  const { step, onClose } = props;

  return (
    <div
      className="fixed inset-0 z-50 fade-in flex items-center justify-center p-6"
      style={{ background: "rgba(15,15,15,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="scale-in rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          boxShadow: "0 30px 80px -10px rgba(0,0,0,0.3)",
          width: step === "wallet-picker" ? 720 : 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "amount" && <DepositAmountStep {...props} layout="desktop" />}
        {step === "wallet-picker" && <DesktopWalletPicker {...props} />}
        {step === "signing" && <SigningStep {...props} layout="desktop" />}
        {step === "complete" && <CompleteStep {...props} layout="desktop" />}
      </div>
    </div>
  );
}

function DesktopWalletPicker({ amount, selectedWallet, onWalletSelect, onQRScan, onClose }) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="text-[15px] font-semibold">Pay with crypto</div>
          <div className="mono text-[11px] mt-0.5" style={{ color: "var(--text-dim)" }}>${parseFloat(amount).toFixed(2)} · WalletConnect Pay</div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex" style={{ minHeight: 440 }}>
        {/* Wallet list */}
        <div className="flex-1 px-6 py-6" style={{ borderRight: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <Search size={14} style={{ color: "var(--text-dimmer)" }} />
            <input placeholder="Search wallet" className="bg-transparent outline-none text-[13px] flex-1" />
          </div>

          <div className="mono text-[10px] tracking-[0.15em] uppercase mb-3 px-1" style={{ color: "var(--text-dimmer)" }}>Installed</div>
          <div className="space-y-1 mb-5">
            {WALLETS.filter(w => w.installed).map(w => (
              <WalletRow key={w.id} wallet={w} selected={selectedWallet?.id === w.id} onClick={() => onWalletSelect(w)} subtitle="Open extension" />
            ))}
          </div>

          <div className="mono text-[10px] tracking-[0.15em] uppercase mb-3 px-1" style={{ color: "var(--text-dimmer)" }}>Mobile wallets</div>
          <div className="space-y-1">
            {WALLETS.filter(w => !w.installed).map(w => (
              <WalletRow key={w.id} wallet={w} selected={selectedWallet?.id === w.id} onClick={() => onWalletSelect(w)} subtitle="Scan with phone" />
            ))}
          </div>
        </div>

        {/* QR panel */}
        <div className="flex flex-col items-center justify-center px-8 py-8" style={{ width: 320, background: "var(--surface-2)" }}>
          <div className="text-center mb-5">
            <div className="mono text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: "var(--text-dimmer)" }}>
              {selectedWallet && !selectedWallet.installed ? `Scan with ${selectedWallet.name}` : "Scan to pay"}
            </div>
            <div className="text-[13px]" style={{ color: "var(--text)" }}>Open your wallet's scanner</div>
          </div>

          <button
            onClick={onQRScan}
            className="relative rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
          >
            <QRCode seed={`wcpay:${amount}:${selectedWallet?.id || 'any'}`} accent={selectedWallet?.color || "var(--accent)"} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface)", border: "3px solid var(--surface)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mono text-[10px] font-bold" style={{ background: selectedWallet?.color || "var(--accent)", color: "white" }}>
                  {selectedWallet?.letter || "WC"}
                </div>
              </div>
            </div>
          </button>

          <div className="mt-4 flex items-center gap-1.5 mono text-[10px]" style={{ color: "var(--text-dim)" }}>
            <Copy size={11} /> Copy link
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletRow({ wallet, selected, onClick, subtitle }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
      style={{
        background: selected ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${selected ? "var(--accent)" : "transparent"}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-semibold" style={{ background: wallet.color, color: "white" }}>
          {wallet.letter}
        </div>
        <div>
          <div className="text-[13px] font-medium">{wallet.name}</div>
          <div className="text-[10px]" style={{ color: "var(--text-dimmer)" }}>{subtitle}</div>
        </div>
      </div>
      <ChevronRight size={14} style={{ color: "var(--text-dimmer)" }} />
    </button>
  );
}

// ========================================================================
// MOBILE
// ========================================================================
function MobileFrame(props) {
  const { balance, activity, depositOpen, onOpenDeposit } = props;

  return (
    <div className="relative">
      {/* Phone outer */}
      <div className="relative rounded-[44px] p-2" style={{ background: "var(--text)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.25)" }}>
        <div className="relative overflow-hidden rounded-[36px]" style={{ background: "var(--surface)", width: 380, height: 780 }}>
          {/* Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-24 h-6 rounded-full" style={{ background: "var(--text)" }} />

          {/* Status bar */}
          <div className="flex justify-between items-center px-7 pt-4 pb-1 mono text-[11px]" style={{ color: "var(--text)" }}>
            <span>9:41</span>
            <span>· · ·</span>
          </div>

          {/* Content */}
          <div className="relative h-[calc(100%-72px)] overflow-hidden">
            <MobileHome balance={balance} activity={activity} onDeposit={onOpenDeposit} />
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-3 flex justify-around items-center" style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}>
            <MobileNavIcon icon={<Home size={20} />} active label="Home" />
            <MobileNavIcon icon={<BarChart3 size={20} />} label="Trade" />
            <MobileNavIcon icon={<Wallet size={20} />} label="Balance" />
            <MobileNavIcon icon={<Settings size={20} />} label="Settings" />
          </div>

          {/* Deposit sheet */}
          {depositOpen && <MobileDepositSheet {...props} />}
        </div>
      </div>
    </div>
  );
}

function MobileNavIcon({ icon, active, label }) {
  return (
    <button className="flex flex-col items-center gap-1" style={{ color: active ? "var(--text)" : "var(--text-dimmer)" }}>
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}

function MobileHome({ balance, activity, onDeposit }) {
  return (
    <div className="px-6 pt-4 pb-20 h-full overflow-y-auto fade-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dimmer)" }}>Welcome back</div>
          <div className="text-[16px] mt-1 font-medium">Mirna</div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium" style={{ background: "linear-gradient(135deg, #3396ff, #6c2bd9)", color: "white" }}>M</div>
      </div>

      <div className="mb-6">
        <div className="mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-dimmer)" }}>Portfolio value</div>
        <div className="serif leading-none" style={{ fontSize: 52, letterSpacing: "-0.02em" }}>
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <button
        onClick={onDeposit}
        className="w-full py-4 rounded-2xl font-medium text-[15px] flex items-center justify-center gap-2 mb-3"
        style={{ background: "var(--text)", color: "var(--surface)" }}
      >
        <ArrowDownLeft size={18} /> Deposit
      </button>
      <div className="grid grid-cols-2 gap-2 mb-10">
        <button className="py-3 rounded-2xl text-[13px] font-medium" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          Trade
        </button>
        <button className="py-3 rounded-2xl text-[13px] font-medium" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          Earn
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium">Activity</span>
        <span className="mono text-[10px]" style={{ color: "var(--text-dim)" }}>View all</span>
      </div>
      <div className="space-y-0.5">
        {activity.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: a.type === "deposit" ? "var(--success-soft)" : "var(--surface-3)" }}>
                {a.type === "deposit" ? <ArrowDownLeft size={13} style={{ color: "var(--success)" }} /> : <BarChart3 size={13} style={{ color: "var(--text-dim)" }} />}
              </div>
              <div>
                <div className="text-[12px] font-medium">{a.label}</div>
                <div className="text-[10px]" style={{ color: "var(--text-dimmer)" }}>{a.sub} · {a.time}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="mono text-[12px]">{a.amount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileDepositSheet(props) {
  const { step, onCloseDeposit } = props;

  return (
    <div className="absolute inset-0 z-20 fade-in" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onCloseDeposit}>
      <div className="absolute bottom-0 left-0 right-0 slide-up rounded-t-[28px] overflow-hidden" style={{ background: "var(--surface)", maxHeight: "92%" }} onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-2)" }} />
        </div>

        {step === "amount" && <DepositAmountStep {...props} layout="mobile" onClose={onCloseDeposit} />}
        {step === "wallet-picker" && <MobileWalletPicker {...props} onClose={onCloseDeposit} />}
        {step === "signing" && <SigningStep {...props} layout="mobile" onClose={onCloseDeposit} />}
        {step === "complete" && <CompleteStep {...props} layout="mobile" onClose={onCloseDeposit} />}
      </div>
    </div>
  );
}

function MobileWalletPicker({ amount, onWalletSelect, onClose }) {
  return (
    <div className="px-6 pb-8 pt-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[15px] font-semibold">Pay with crypto</div>
          <div className="mono text-[11px] mt-0.5" style={{ color: "var(--text-dim)" }}>${parseFloat(amount).toFixed(2)} · WalletConnect Pay</div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <Search size={14} style={{ color: "var(--text-dimmer)" }} />
        <input placeholder="Search wallet" className="bg-transparent outline-none text-[13px] flex-1" />
      </div>

      <div className="mono text-[10px] tracking-[0.15em] uppercase mb-2 px-1" style={{ color: "var(--text-dimmer)" }}>Select a wallet</div>
      <div className="space-y-1 max-h-[420px] overflow-y-auto">
        {WALLETS.map(w => (
          <WalletRow key={w.id} wallet={w} onClick={() => onWalletSelect(w)} subtitle="Open wallet" />
        ))}
      </div>

      <div className="mt-4 text-center mono text-[10px]" style={{ color: "var(--text-dimmer)" }}>
        Don't have a wallet? <span style={{ color: "var(--accent)" }}>Get one</span>
      </div>
    </div>
  );
}

// ========================================================================
// SHARED STEPS
// ========================================================================
function DepositAmountStep({ amount, setAmount, method, setMethod, onContinue, onClose, layout }) {
  const valid = method === "wallet" && parseFloat(amount) > 0;
  const isMobile = layout === "mobile";

  return (
    <div className={isMobile ? "px-6 pb-8 pt-2" : "p-7"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[15px] font-semibold">Deposit</div>
          <div className="mono text-[11px] mt-0.5" style={{ color: "var(--text-dim)" }}>Add funds to your account</div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Method tabs */}
      <div className="mono text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-dimmer)" }}>Method</div>
      <div className="grid grid-cols-2 gap-2 mb-7">
        <button
          onClick={() => setMethod("wallet")}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left"
          style={{
            background: method === "wallet" ? "var(--accent-soft)" : "var(--surface-2)",
            border: `1px solid ${method === "wallet" ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: method === "wallet" ? "var(--accent)" : "var(--surface-3)" }}>
            <Wallet size={16} style={{ color: method === "wallet" ? "white" : "var(--text-dim)" }} />
          </div>
          <div>
            <div className="text-[13px] font-medium">Wallet</div>
            <div className="text-[10px]" style={{ color: "var(--text-dimmer)" }}>Instant</div>
          </div>
        </button>
        <button
          disabled
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left opacity-60 cursor-not-allowed"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <Building2 size={16} style={{ color: "var(--text-dim)" }} />
          </div>
          <div>
            <div className="text-[13px] font-medium">Bank</div>
            <div className="text-[10px]" style={{ color: "var(--text-dimmer)" }}>Coming soon</div>
          </div>
        </button>
      </div>

      {/* Amount */}
      <div className="text-center mb-6">
        <div className="mono text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-dimmer)" }}>Amount</div>
        <div className="flex items-baseline justify-center gap-1">
          <span className="serif" style={{ fontSize: 32, color: "var(--text-dim)" }}>$</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="bg-transparent outline-none serif text-center"
            style={{ fontSize: 64, letterSpacing: "-0.02em", width: "60%", color: "var(--text)" }}
          />
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {[50, 100, 500, 1000].map(v => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="px-3.5 py-1.5 rounded-full mono text-[11px]"
              style={{ background: "var(--surface-2)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
            >
              ${v}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!valid}
        className="w-full py-3.5 rounded-2xl font-medium text-[14px] flex items-center justify-center gap-2 transition-all"
        style={{
          background: valid ? "var(--text)" : "var(--surface-3)",
          color: valid ? "var(--surface)" : "var(--text-dimmer)",
          cursor: valid ? "pointer" : "not-allowed",
        }}
      >
        Continue <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SigningStep({ selectedWallet, amount, layout, onClose }) {
  const isMobile = layout === "mobile";
  return (
    <div className={`${isMobile ? "px-6 pb-10 pt-4" : "p-10"} text-center`}>
      <div className="flex items-center justify-between mb-8">
        <div className="text-[15px] font-semibold text-left">Confirming payment</div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl" style={{ background: (selectedWallet?.color || "var(--accent)") + "33", animation: "pulseRing 2s infinite" }} />
          <div className="absolute inset-0 rounded-2xl" style={{ background: (selectedWallet?.color || "var(--accent)") + "33", animation: "pulseRing 2s infinite 0.7s" }} />
          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-[28px] font-bold" style={{ background: selectedWallet?.color || "var(--accent)", color: "white" }}>
            {selectedWallet?.letter || "W"}
          </div>
        </div>

        <div className="serif text-[24px] leading-tight mb-2">
          Opening {selectedWallet?.name || "your wallet"}
        </div>
        <div className="text-[13px] max-w-[260px] mx-auto" style={{ color: "var(--text-dim)" }}>
          Approve the ${parseFloat(amount).toFixed(2)} payment in {selectedWallet?.name || "your wallet"} to complete the deposit.
        </div>

        <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
          <span className="mono text-[11px]">Waiting for signature</span>
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ amount, selectedWallet, onComplete, layout }) {
  const [shown, setShown] = useState(0);
  const target = parseFloat(amount) || 0;

  useEffect(() => {
    let frame;
    const start = performance.now();
    const dur = 900;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(target * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const isMobile = layout === "mobile";

  return (
    <div className={`${isMobile ? "px-6 pb-8 pt-4" : "p-10"} text-center`}>
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-7" style={{ background: "var(--success)", animation: "successPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}>
          <Check size={36} style={{ color: "white" }} strokeWidth={3} />
        </div>

        <div className="mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-dimmer)" }}>Deposit complete</div>
        <div className="serif leading-none mb-2" style={{ fontSize: 56, letterSpacing: "-0.02em" }}>
          +${shown.toFixed(2)}
        </div>
        {selectedWallet && (
          <div className="mono text-[11px]" style={{ color: "var(--text-dim)" }}>
            via {selectedWallet.name}
          </div>
        )}

        <div className="mt-10 w-full px-5 py-4 rounded-2xl text-left" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="mono text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: "var(--text-dimmer)" }}>Transaction</div>
          <div className="flex items-center justify-between">
            <span className="mono text-[11px]" style={{ color: "var(--text-dim)" }}>0x7a4F…b3e2</span>
            <span className="mono text-[10px] flex items-center gap-1" style={{ color: "var(--success)" }}>
              <Check size={10} /> Confirmed
            </span>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-6 py-3.5 rounded-2xl font-medium text-[14px]"
          style={{ background: "var(--text)", color: "var(--surface)" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ========================================================================
// QR PATTERN
// ========================================================================
function QRCode({ seed, accent }) {
  const cells = generateQRPattern(seed);
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
      {cells.map((row, i) => row.map((cell, j) => (
        <div
          key={`${i}-${j}`}
          className="qr-cell"
          style={{
            width: 6,
            height: 6,
            background: cell ? "var(--text)" : "transparent",
            borderRadius: 1,
          }}
        />
      )))}
    </div>
  );
}

function generateQRPattern(seed) {
  const size = 25;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) | 0;
    return ((h >>> 0) % 1000) / 1000;
  };
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j] = rand() > 0.52;
    }
  }
  const drawFinder = (r, c) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const onBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        grid[r + i][c + j] = onBorder || inner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);
  return grid;
}
