import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, Bell, Boxes,
  ChevronDown, ChevronRight, CircleDollarSign, ClipboardList, Factory,
  FileText, LayoutDashboard, Leaf, Menu, Package, Plus, Search, Settings,
  ShoppingCart, Truck, Users, Wheat, X,
} from 'lucide-react';
import './App.css';

const seed = {
  suppliers: [
    { id: 'sup-1', name: 'Green Valley Farms', type: 'Paddy', contact: '077 238 9142', location: 'Polonnaruwa', balance: 186000 },
    { id: 'sup-2', name: 'Lanka Packaging Co.', type: 'Bags & packaging', contact: '011 458 2270', location: 'Colombo', balance: 0 },
    { id: 'sup-3', name: 'AgriTech Machinery', type: 'Equipment', contact: '081 225 9033', location: 'Kandy', balance: 42500 },
    { id: 'sup-4', name: 'Kumbukwewa Growers', type: 'Paddy', contact: '071 642 1083', location: 'Anuradhapura', balance: 92500 },
  ],
  stock: [
    { id: 'paddy', name: 'Nadu paddy', group: 'Paddy', qty: 42.8, unit: 't', reorder: 12, value: 1754800 },
    { id: 'samba', name: 'Samba rice', group: 'Milled rice', qty: 15.2, unit: 't', reorder: 8, value: 1140000 },
    { id: 'nadu-rice', name: 'Nadu rice', group: 'Milled rice', qty: 21.6, unit: 't', reorder: 10, value: 1404000 },
    { id: 'broken', name: 'Broken rice', group: 'Milled rice', qty: 3.4, unit: 't', reorder: 2, value: 136000 },
    { id: 'bags', name: '25 kg woven bags', group: 'Packaging', qty: 2400, unit: 'bags', reorder: 800, value: 144000 },
    { id: 'packed-samba', name: 'Samba rice · 25 kg', group: 'Packed goods', qty: 1100, unit: 'bags', reorder: 250, value: 1100000 },
  ],
  batches: [
    { id: 'B-2408', date: '2026-10-04', paddy: 6.4, rice: 'Nadu rice', output: 4.62, byproduct: 1.3 },
    { id: 'B-2407', date: '2026-10-03', paddy: 5.8, rice: 'Samba rice', output: 4.13, byproduct: 1.2 },
    { id: 'B-2406', date: '2026-10-02', paddy: 4.2, rice: 'Nadu rice', output: 3.06, byproduct: 0.84 },
  ],
  sales: [
    { id: 'INV-1842', date: '2026-10-04', buyer: 'Sunrise Wholesale', item: 'Samba rice · 25 kg', qty: 120, total: 198000, status: 'Credit' },
    { id: 'INV-1841', date: '2026-10-03', buyer: 'City Market Stores', item: 'Nadu rice', qty: 2.5, total: 205000, status: 'Paid' },
    { id: 'INV-1840', date: '2026-10-02', buyer: 'Lakshmi Traders', item: 'Samba rice · 25 kg', qty: 80, total: 132000, status: 'Paid' },
  ],
  ledger: [
    { id: 'LED-091', date: '2026-10-04', description: 'Invoice INV-1842 · Sunrise Wholesale', account: 'Accounts receivable', kind: 'Receivable', amount: 198000 },
    { id: 'LED-090', date: '2026-10-04', description: 'Paddy purchase · Green Valley Farms', account: 'Paddy purchases', kind: 'Payable', amount: 186000 },
    { id: 'LED-089', date: '2026-10-03', description: 'Invoice INV-1841 · City Market Stores', account: 'Sales income', kind: 'Income', amount: 205000 },
    { id: 'LED-088', date: '2026-10-03', description: 'Electricity · September', account: 'Utilities', kind: 'Expense', amount: 38400 },
    { id: 'LED-087', date: '2026-10-02', description: 'Invoice INV-1840 · Lakshmi Traders', account: 'Sales income', kind: 'Income', amount: 132000 },
  ],
};

const nav = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Stock', icon: Boxes },
  { name: 'Milling', icon: Factory },
  { name: 'Packaging', icon: Package },
  { name: 'Sales', icon: ShoppingCart },
  { name: 'Accounts', icon: CircleDollarSign },
  { name: 'Suppliers', icon: Users },
];

const money = (amount) => `LKR ${Number(amount || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
const number = (value, digits = 1) => Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: digits });
const today = () => new Date().toISOString().slice(0, 10);
const createId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

function getInitialData() {
  try {
    const saved = localStorage.getItem('fieldnote-rice-mill-v1');
    return saved ? JSON.parse(saved) : seed;
  } catch {
    return seed;
  }
}

function App() {
  const [data, setData] = useState(getInitialData);
  const [page, setPage] = useState('Overview');
  const [modal, setModal] = useState('');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => { localStorage.setItem('fieldnote-rice-mill-v1', JSON.stringify(data)); }, [data]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const totals = useMemo(() => {
    const receivable = data.ledger.filter((entry) => entry.kind === 'Receivable').reduce((sum, entry) => sum + entry.amount, 0);
    const payable = data.ledger.filter((entry) => entry.kind === 'Payable').reduce((sum, entry) => sum + entry.amount, 0);
    const rice = data.stock.filter((item) => item.group === 'Milled rice').reduce((sum, item) => sum + item.qty, 0);
    const paddy = data.stock.find((item) => item.id === 'paddy')?.qty || 0;
    const low = data.stock.filter((item) => item.qty <= item.reorder).length;
    return { receivable, payable, rice, paddy, low };
  }, [data]);

  const updateStock = (id, delta) => setData((current) => ({
    ...current,
    stock: current.stock.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item),
  }));

  const addLedger = (description, account, kind, amount) => ({
    id: createId('LED'), date: today(), description, account, kind, amount: Number(amount),
  });

  const saveEntry = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = Object.fromEntries(form.entries());
    const amount = Number(value.amount || 0);

    if (modal === 'receive') {
      const item = data.stock.find((row) => row.id === value.item);
      const qty = Number(value.qty);
      if (!item || qty <= 0) return;
      updateStock(item.id, qty);
      const balance = amount - Number(value.paid || 0);
      setData((current) => ({
        ...current,
        suppliers: current.suppliers.map((supplier) => supplier.id === value.supplier ? { ...supplier, balance: supplier.balance + balance } : supplier),
        ledger: [addLedger(`${item.name} received · ${data.suppliers.find((supplier) => supplier.id === value.supplier)?.name}`, 'Purchases', balance ? 'Payable' : 'Expense', amount), ...current.ledger],
      }));
      setToast(`${number(qty)} ${item.unit} added to ${item.name.toLowerCase()} stock`);
    } else if (modal === 'milling') {
      const paddy = Number(value.paddy);
      const output = Number(value.output);
      const product = data.stock.find((row) => row.id === value.product);
      const raw = data.stock.find((row) => row.id === 'paddy');
      if (!product || !raw || paddy <= 0 || output <= 0 || paddy > raw.qty || output >= paddy) {
        setToast('Check paddy and rice quantities before saving this batch');
        return;
      }
      setData((current) => ({
        ...current,
        stock: current.stock.map((item) => item.id === 'paddy' ? { ...item, qty: item.qty - paddy } : item.id === product.id ? { ...item, qty: item.qty + output } : item),
        batches: [{ id: createId('B'), date: value.date, paddy, rice: product.name, output, byproduct: Math.max(0, paddy - output) }, ...current.batches],
      }));
      setToast('Milling batch recorded and stock balances updated');
    } else if (modal === 'pack') {
      const rice = data.stock.find((row) => row.id === value.rice);
      const bags = data.stock.find((row) => row.id === 'bags');
      const riceQty = Number(value.riceQty);
      const bagSize = Number(value.bagSize);
      const bagCount = Math.floor((riceQty * 1000) / bagSize);
      const packedId = `packed-${value.rice}-${bagSize}`;
      const packed = data.stock.find((row) => row.id === packedId);
      if (!rice || !bags || riceQty <= 0 || riceQty > rice.qty || bagCount > bags.qty) {
        setToast('Not enough rice or packaging stock for this run');
        return;
      }
      setData((current) => {
        const exists = current.stock.some((row) => row.id === packedId);
        const stock = current.stock.map((item) => item.id === rice.id ? { ...item, qty: item.qty - riceQty } : item.id === 'bags' ? { ...item, qty: item.qty - bagCount } : item.id === packedId ? { ...item, qty: item.qty + bagCount } : item);
        if (!exists) stock.push({ id: packedId, name: `${rice.name} · ${bagSize} kg`, group: 'Packed goods', qty: bagCount, unit: 'bags', reorder: 100, value: 0 });
        return { ...current, stock };
      });
      setToast(`${number(bagCount, 0)} bags packed and stock balances updated`);
    } else if (modal === 'sale') {
      const item = data.stock.find((row) => row.id === value.item);
      const qty = Number(value.qty);
      if (!item || qty <= 0 || qty > item.qty || amount <= 0) {
        setToast('Check available stock and enter a valid sale amount');
        return;
      }
      const invoice = createId('INV');
      setData((current) => ({
        ...current,
        stock: current.stock.map((row) => row.id === item.id ? { ...row, qty: row.qty - qty } : row),
        sales: [{ id: invoice, date: value.date, buyer: value.buyer, item: item.name, qty, total: amount, status: value.status }, ...current.sales],
        ledger: [addLedger(`Invoice ${invoice} · ${value.buyer}`, value.status === 'Paid' ? 'Sales income' : 'Accounts receivable', value.status === 'Paid' ? 'Income' : 'Receivable', amount), ...current.ledger],
      }));
      setToast(`Sale ${invoice} recorded`);
    } else if (modal === 'expense') {
      if (!value.description || amount <= 0) return;
      setData((current) => ({ ...current, ledger: [addLedger(value.description, value.account, 'Expense', amount), ...current.ledger] }));
      setToast('Expense added to the account ledger');
    } else if (modal === 'supplier') {
      if (!value.name) return;
      setData((current) => ({ ...current, suppliers: [{ id: createId('SUP'), name: value.name, type: value.type, contact: value.contact, location: value.location, balance: 0 }, ...current.suppliers] }));
      setToast('Supplier added to your directory');
    }
    setModal('');
  };

  const openEntry = (type) => setModal(type);
  const title = page === 'Overview' ? 'Good morning, mill team' : page;
  const subtitle = page === 'Overview' ? 'Here is what is happening at your mill today.' : `Manage your mill's ${page.toLowerCase()} and keep every movement accounted for.`;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Wheat size={20} strokeWidth={1.8} /></div><div><span className="brand-name">fieldnote</span><span className="brand-caption">MILL OPERATIONS</span></div><button className="close-nav icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="mill-switch"><div className="mill-avatar">KM</div><div className="mill-details"><strong>Kumbuk Mill</strong><span>Polonnaruwa, LK</span></div><ChevronDown size={15} /></div>
        <span className="nav-label">WORKSPACE</span>
        <nav className="main-nav" aria-label="Main navigation">
          {nav.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${page === name ? 'active' : ''}`} onClick={() => { setPage(name); setMobileNav(false); }}><Icon size={18} strokeWidth={1.8} /><span>{name}</span>{name === 'Stock' && totals.low > 0 && <span className="nav-count">{totals.low}</span>}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="season-card"><div className="season-icon"><Leaf size={17} /></div><div><span>Yala season</span><strong>2026 harvest</strong></div><span className="season-dot" /></div>
        <button className="nav-item settings-link" onClick={() => setToast('Mill settings are coming soon')}><Settings size={18} strokeWidth={1.8} /><span>Settings</span></button>
        <div className="user-profile"><div className="user-avatar">PM</div><div className="user-details"><strong>Pradeep M.</strong><span>Mill administrator</span></div><ChevronDown size={15} /></div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Mill</span><ChevronRight size={14} /><strong>{page}</strong></div><div className="topbar-actions"><div className="today-label">{new Date().toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast(`${totals.low} stock items need attention`)}><Bell size={18} /><i /></button><div className="top-avatar">PM</div></div></header>
        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow">KUMBUK MILL <span>·</span> OPERATIONS</div><h1>{title}</h1><p>{subtitle}</p></div><div className="heading-actions">{page === 'Overview' && <button className="button button-secondary" onClick={() => openEntry('receive')}><ArrowDownLeft size={16} /> Receive stock</button>}<button className="button button-primary" onClick={() => openEntry(page === 'Milling' ? 'milling' : page === 'Packaging' ? 'pack' : page === 'Sales' ? 'sale' : page === 'Accounts' ? 'expense' : page === 'Suppliers' ? 'supplier' : 'receive')}><Plus size={17} />{page === 'Milling' ? 'New batch' : page === 'Packaging' ? 'Pack rice' : page === 'Sales' ? 'New sale' : page === 'Accounts' ? 'Add expense' : page === 'Suppliers' ? 'Add supplier' : 'Record stock'}</button></div></div>

          {page === 'Overview' && <Dashboard data={data} totals={totals} onAction={openEntry} />}
          {page === 'Stock' && <StockPage stock={data.stock} query={query} setQuery={setQuery} onReceive={() => openEntry('receive')} />}
          {page === 'Milling' && <MillingPage batches={data.batches} stock={data.stock} onAdd={() => openEntry('milling')} />}
          {page === 'Packaging' && <PackagingPage stock={data.stock} onPack={() => openEntry('pack')} />}
          {page === 'Sales' && <SalesPage sales={data.sales} query={query} setQuery={setQuery} onAdd={() => openEntry('sale')} />}
          {page === 'Accounts' && <AccountsPage ledger={data.ledger} totals={totals} onExpense={() => openEntry('expense')} />}
          {page === 'Suppliers' && <SuppliersPage suppliers={data.suppliers} onAdd={() => openEntry('supplier')} />}
        </div>
        <footer className="page-footer"><span>Fieldnote <span className="footer-dot">·</span> Kumbuk Mill</span><span>All quantities and balances update as you record activity.</span></footer>
      </main>

      {modal && <EntryModal type={modal} data={data} onClose={() => setModal('')} onSave={saveEntry} />}
      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
    </div>
  );
}

function Dashboard({ data, totals, onAction }) {
  const metrics = [
    { label: 'Paddy on hand', value: `${number(totals.paddy)} t`, detail: 'Raw paddy stock', icon: Wheat, tone: 'green', change: 'Raw material' },
    { label: 'Milled rice', value: `${number(totals.rice)} t`, detail: 'Across all rice types', icon: Boxes, tone: 'gold', change: '3 varieties' },
    { label: 'To collect', value: money(totals.receivable), detail: 'Customer receivables', icon: ArrowDownLeft, tone: 'blue', change: 'From sales' },
    { label: 'To pay suppliers', value: money(totals.payable), detail: 'Outstanding payables', icon: ArrowUpRight, tone: 'rose', change: 'Supplier balance' },
  ];
  return <>
    <section className="metric-grid">{metrics.map(({ label, value, detail, icon: Icon, tone, change }) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={17} /></span></div><strong className="metric-value">{value}</strong><div className="metric-bottom"><span>{detail}</span><span className="metric-tag">{change}</span></div></article>)}</section>
    <div className="dashboard-grid">
      <section className="panel production-panel"><div className="panel-heading"><div><h2>Production at a glance</h2><p>Mill activity over the last 7 days</p></div><button className="subtle-select" onClick={() => onAction('milling')}>This week <ChevronDown size={14} /></button></div><div className="production-summary"><div><span>Raw paddy milled</span><strong>31.6 <small>t</small></strong></div><div><span>Rice produced</span><strong>22.4 <small>t</small></strong></div><div><span>Avg. recovery</span><strong>70.9<small>%</small></strong></div></div><div className="chart-area"><div className="chart-y-labels"><span>8 t</span><span>6 t</span><span>4 t</span><span>2 t</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="bar-groups">{[{ day: 'Mon', p: 58, r: 39 }, { day: 'Tue', p: 74, r: 51 }, { day: 'Wed', p: 47, r: 33 }, { day: 'Thu', p: 88, r: 62 }, { day: 'Fri', p: 67, r: 48 }, { day: 'Sat', p: 95, r: 69 }, { day: 'Sun', p: 72, r: 52 }].map((bar) => <div className="bar-group" key={bar.day}><div className="bar-pair"><i className="bar-paddy" style={{ height: `${bar.p}%` }} /><i className="bar-rice" style={{ height: `${bar.r}%` }} /></div><span>{bar.day}</span></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-paddy" />Paddy milled</span><span><i className="legend-rice" />Rice produced</span><span className="chart-footnote">Values shown in tonnes</span></div></section>
      <section className="panel stock-panel"><div className="panel-heading"><div><h2>Stock watch</h2><p>Inventory that needs attention</p></div><button className="text-link" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'Stock' }))}>View stock <ChevronRight size={14} /></button></div>{data.stock.filter((item) => item.qty <= item.reorder).length ? <div className="stock-watch-list">{data.stock.filter((item) => item.qty <= item.reorder).map((item) => <div className="stock-watch-row" key={item.id}><div className="stock-watch-icon"><Package size={16} /></div><div className="stock-watch-name"><strong>{item.name}</strong><span>Reorder point {number(item.reorder, 0)} {item.unit}</span></div><div className="stock-watch-qty"><strong>{number(item.qty, 0)}</strong><span>{item.unit} left</span></div></div>)}</div> : <div className="empty-state">All stock levels are above their reorder points.</div>}<button className="panel-action" onClick={() => onAction('receive')}><Plus size={15} />Receive a delivery</button></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest mill transactions</p></div><button className="text-link" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'Accounts' }))}>All activity <ChevronRight size={14} /></button></div><div className="activity-list">{data.ledger.slice(0, 4).map((entry) => <div className="activity-row" key={entry.id}><div className={`activity-icon ${entry.kind.toLowerCase()}`}>{entry.kind === 'Income' ? <ArrowDownLeft size={15} /> : entry.kind === 'Expense' ? <ArrowUpRight size={15} /> : <ArrowLeftRight size={15} />}</div><div className="activity-copy"><strong>{entry.description}</strong><span>{entry.account} <i>·</i> {entry.date}</span></div><strong className={`activity-amount ${entry.kind === 'Expense' || entry.kind === 'Payable' ? 'negative' : ''}`}>{entry.kind === 'Expense' || entry.kind === 'Payable' ? '−' : '+'}{money(entry.amount)}</strong></div>)}</div></section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Keep your mill moving</p></div></div><div className="quick-action-grid"><button onClick={() => onAction('receive')}><span className="quick-icon receive"><Truck size={17} /></span><span><strong>Receive stock</strong><small>Paddy, bags or supplies</small></span><ChevronRight size={15} /></button><button onClick={() => onAction('milling')}><span className="quick-icon milling"><Factory size={17} /></span><span><strong>Log milling batch</strong><small>Convert paddy to rice</small></span><ChevronRight size={15} /></button><button onClick={() => onAction('sale')}><span className="quick-icon sale"><ShoppingCart size={17} /></span><span><strong>Record a sale</strong><small>Invoice a rice buyer</small></span><ChevronRight size={15} /></button><button onClick={() => onAction('expense')}><span className="quick-icon expense"><FileText size={17} /></span><span><strong>Add an expense</strong><small>Track mill outgoings</small></span><ChevronRight size={15} /></button></div></section>
    </div>
  </>;
}

function StockPage({ stock, query, setQuery, onReceive }) {
  const [filter, setFilter] = useState('All stock');
  const filters = ['All stock', 'Paddy', 'Milled rice', 'Packaging', 'Packed goods'];
  const visible = stock.filter((item) => (filter === 'All stock' || item.group === filter) && item.name.toLowerCase().includes(query.toLowerCase()));
  return <><div className="section-toolbar"><div className="filter-tabs">{filters.map((item) => <button className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stock" /></label><button className="button button-secondary" onClick={onReceive}><ArrowDownLeft size={16} /> Receive stock</button></div></div><section className="panel table-panel"><div className="table-heading"><div><h2>Inventory</h2><p>{visible.length} stock items across your mill</p></div><span className="table-date">Updated just now</span></div><StockTable stock={visible} /></section><div className="info-strip"><div className="info-icon"><ClipboardList size={18} /></div><div><strong>Stock follows your workflow</strong><span>Receipts add raw materials, milling transfers paddy into rice, and packaging moves rice into finished bags.</span></div></div></>;
}

function StockTable({ stock }) {
  return <div className="table-scroll"><table><thead><tr><th>ITEM</th><th>STOCK TYPE</th><th>ON HAND</th><th>REORDER AT</th><th>STOCK VALUE</th><th>STATUS</th></tr></thead><tbody>{stock.map((item) => { const low = item.qty <= item.reorder; return <tr key={item.id}><td><div className="item-cell"><span className={`item-dot ${item.group === 'Paddy' ? 'dot-paddy' : item.group === 'Packaging' ? 'dot-bag' : item.group === 'Packed goods' ? 'dot-packed' : 'dot-rice'}`} /><strong>{item.name}</strong></div></td><td><span className="type-label">{item.group}</span></td><td><strong>{number(item.qty, item.unit === 't' ? 1 : 0)} <small>{item.unit}</small></strong></td><td>{number(item.reorder, 0)} {item.unit}</td><td>{money(item.value)}</td><td><span className={`status-pill ${low ? 'status-low' : 'status-good'}`}><i />{low ? 'Reorder' : 'In stock'}</span></td></tr>; })}</tbody></table>{stock.length === 0 && <div className="empty-state">No stock items match this search.</div>}</div>;
}

function MillingPage({ batches, stock, onAdd }) {
  const paddy = stock.find((item) => item.id === 'paddy')?.qty || 0;
  const rice = batches.reduce((sum, batch) => sum + batch.output, 0);
  return <><div className="mini-stat-grid"><MiniStat label="Raw paddy available" value={`${number(paddy)} t`} icon={Wheat} tone="green" /><MiniStat label="Batches this season" value={batches.length} icon={Factory} tone="gold" /><MiniStat label="Rice produced" value={`${number(rice)} t`} icon={Boxes} tone="blue" /><MiniStat label="Average recovery" value={`${paddy ? number((rice / (rice + batches.reduce((sum, batch) => sum + batch.paddy, 0))) * 100, 1) : '0'}%`} icon={BarChart3} tone="rose" /></div><section className="panel table-panel"><div className="table-heading"><div><h2>Milling batches</h2><p>Raw paddy processed into rice materials</p></div><button className="button button-secondary" onClick={onAdd}><Plus size={16} /> New batch</button></div><div className="table-scroll"><table><thead><tr><th>BATCH</th><th>DATE</th><th>PADDY INPUT</th><th>RICE OUTPUT</th><th>BYPRODUCT</th><th>RECOVERY</th></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td><strong className="mono-label">{batch.id}</strong></td><td>{batch.date}</td><td>{number(batch.paddy)} t</td><td><div className="output-cell"><strong>{number(batch.output)} t</strong><span>{batch.rice}</span></div></td><td>{number(batch.byproduct)} t</td><td><span className="yield-pill">{number((batch.output / batch.paddy) * 100)}%</span></td></tr>)}</tbody></table></div></section><div className="info-strip"><div className="info-icon"><Factory size={18} /></div><div><strong>Every batch updates raw and finished stock</strong><span>Enter the paddy used and the rice variety produced. Recovery is calculated from the recorded output.</span></div></div></>;
}

function PackagingPage({ stock, onPack }) {
  const bags = stock.find((item) => item.id === 'bags')?.qty || 0;
  const packed = stock.filter((item) => item.group === 'Packed goods');
  return <><div className="mini-stat-grid"><MiniStat label="Available bag stock" value={`${number(bags, 0)} bags`} icon={Package} tone="gold" /><MiniStat label="Packed rice varieties" value={packed.length} icon={Boxes} tone="green" /><MiniStat label="Finished goods on hand" value={`${number(packed.reduce((sum, item) => sum + item.qty, 0), 0)} bags`} icon={ClipboardList} tone="blue" /><MiniStat label="Available milled rice" value={`${number(stock.filter((item) => item.group === 'Milled rice').reduce((sum, item) => sum + item.qty, 0))} t`} icon={Wheat} tone="rose" /></div><section className="panel table-panel"><div className="table-heading"><div><h2>Finished goods & packaging</h2><p>Bag inventory and ready-to-sell rice</p></div><button className="button button-secondary" onClick={onPack}><Package size={16} /> Pack rice</button></div><StockTable stock={stock.filter((item) => item.group === 'Packaging' || item.group === 'Packed goods')} /></section><div className="info-strip"><div className="info-icon"><Package size={18} /></div><div><strong>Packaging consumes both rice and empty bags</strong><span>Pick a rice type and bag size; the app checks stock and creates a finished-goods item automatically.</span></div></div></>;
}

function SalesPage({ sales, query, setQuery, onAdd }) {
  const filtered = sales.filter((sale) => `${sale.buyer} ${sale.id} ${sale.item}`.toLowerCase().includes(query.toLowerCase()));
  const outstanding = sales.filter((sale) => sale.status !== 'Paid').reduce((sum, sale) => sum + sale.total, 0);
  return <><div className="mini-stat-grid"><MiniStat label="Sales this month" value={money(sales.reduce((sum, sale) => sum + sale.total, 0))} icon={ShoppingCart} tone="green" /><MiniStat label="Invoices" value={sales.length} icon={FileText} tone="blue" /><MiniStat label="Outstanding invoices" value={money(outstanding)} icon={ArrowDownLeft} tone="gold" /><MiniStat label="Buyers served" value={new Set(sales.map((sale) => sale.buyer)).size} icon={Users} tone="rose" /></div><section className="panel table-panel"><div className="table-heading"><div><h2>Sales invoices</h2><p>Rice sold to shops, wholesalers and other sellers</p></div><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an invoice" /></label></div><div className="table-scroll"><table><thead><tr><th>INVOICE</th><th>DATE</th><th>BUYER</th><th>PRODUCT</th><th>QUANTITY</th><th>TOTAL</th><th>PAYMENT</th></tr></thead><tbody>{filtered.map((sale) => <tr key={sale.id}><td><strong className="mono-label">{sale.id}</strong></td><td>{sale.date}</td><td><strong>{sale.buyer}</strong></td><td>{sale.item}</td><td>{number(sale.qty, sale.item.includes('25 kg') ? 0 : 1)} {sale.item.includes('25 kg') ? 'bags' : 't'}</td><td><strong>{money(sale.total)}</strong></td><td><span className={`status-pill ${sale.status === 'Paid' ? 'status-good' : 'status-due'}`}><i />{sale.status}</span></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No invoices match this search.</div>}</div></section><div className="info-strip"><div className="info-icon"><ShoppingCart size={18} /></div><div><strong>Sales reduce stock and update accounts</strong><span>Paid invoices are recorded as income. Credit invoices create a receivable balance for the buyer.</span></div></div></>;
}

function AccountsPage({ ledger, totals, onExpense }) {
  const income = ledger.filter((entry) => entry.kind === 'Income').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = ledger.filter((entry) => entry.kind === 'Expense').reduce((sum, entry) => sum + entry.amount, 0);
  return <><div className="mini-stat-grid"><MiniStat label="Sales income" value={money(income)} icon={ArrowDownLeft} tone="green" /><MiniStat label="Mill expenses" value={money(expenses)} icon={ArrowUpRight} tone="rose" /><MiniStat label="Accounts receivable" value={money(totals.receivable)} icon={Users} tone="blue" /><MiniStat label="Supplier payables" value={money(totals.payable)} icon={Truck} tone="gold" /></div><section className="panel table-panel"><div className="table-heading"><div><h2>Account ledger</h2><p>Sales, purchases, expenses and balances</p></div><button className="button button-secondary" onClick={onExpense}><Plus size={16} /> Add expense</button></div><div className="table-scroll"><table><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>ACCOUNT</th><th>ENTRY TYPE</th><th className="align-right">AMOUNT</th></tr></thead><tbody>{ledger.map((entry) => <tr key={entry.id}><td>{entry.date}</td><td><strong>{entry.description}</strong></td><td>{entry.account}</td><td><span className={`ledger-kind kind-${entry.kind.toLowerCase()}`}>{entry.kind}</span></td><td className={`align-right ledger-amount ${entry.kind === 'Expense' || entry.kind === 'Payable' ? 'negative' : ''}`}>{entry.kind === 'Expense' || entry.kind === 'Payable' ? '−' : '+'}{money(entry.amount)}</td></tr>)}</tbody></table></div></section><div className="info-strip"><div className="info-icon"><CircleDollarSign size={18} /></div><div><strong>Operational ledger, not formal double-entry accounting</strong><span>Use this view to track mill cash flow, outstanding customer invoices and supplier balances. Opening entries are sample data.</span></div></div></>;
}

function SuppliersPage({ suppliers, onAdd }) {
  const types = [...new Set(suppliers.map((supplier) => supplier.type))];
  return <><div className="mini-stat-grid"><MiniStat label="Active suppliers" value={suppliers.length} icon={Users} tone="green" /><MiniStat label="Paddy suppliers" value={suppliers.filter((supplier) => supplier.type === 'Paddy').length} icon={Wheat} tone="gold" /><MiniStat label="Packaging suppliers" value={suppliers.filter((supplier) => supplier.type === 'Bags & packaging').length} icon={Package} tone="blue" /><MiniStat label="Equipment suppliers" value={suppliers.filter((supplier) => supplier.type === 'Equipment').length} icon={Settings} tone="rose" /></div><section className="panel table-panel"><div className="table-heading"><div><h2>Supplier directory</h2><p>Paddy, equipment, and packaging partners</p></div><button className="button button-secondary" onClick={onAdd}><Plus size={16} /> Add supplier</button></div><div className="table-scroll"><table><thead><tr><th>SUPPLIER</th><th>SUPPLY TYPE</th><th>LOCATION</th><th>CONTACT</th><th className="align-right">BALANCE DUE</th></tr></thead><tbody>{suppliers.map((supplier) => <tr key={supplier.id}><td><div className="supplier-cell"><span className="supplier-avatar">{supplier.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><strong>{supplier.name}</strong></div></td><td><span className={`supplier-type type-${supplier.type.startsWith('Paddy') ? 'paddy' : supplier.type.startsWith('Equipment') ? 'equipment' : 'bags'}`}>{supplier.type}</span></td><td>{supplier.location}</td><td>{supplier.contact}</td><td className="align-right"><strong className={supplier.balance ? 'due-value' : ''}>{money(supplier.balance)}</strong></td></tr>)}</tbody></table></div></section><div className="info-strip"><div className="info-icon"><Truck size={18} /></div><div><strong>One directory for every kind of supplier</strong><span>Register paddy growers, equipment vendors, and bag or packaging suppliers separately.</span></div></div><span className="sr-only">Supplier categories: {types.join(', ')}</span></>;
}

function MiniStat({ label, value, icon: Icon, tone }) {
  return <article className="mini-stat"><span className={`mini-stat-icon ${tone}`}><Icon size={17} /></span><div><span>{label}</span><strong>{value}</strong></div></article>;
}

function EntryModal({ type, data, onClose, onSave }) {
  const labels = { receive: ['Receive stock', 'Record a delivery and update your inventory.'], milling: ['New milling batch', 'Convert paddy into a selected rice material.'], pack: ['Pack rice', 'Use milled rice and bags to create finished goods.'], sale: ['Record a sale', 'Invoice a seller and update stock and accounts.'], expense: ['Add an expense', 'Record a mill cost in the account ledger.'], supplier: ['Add supplier', 'Keep your paddy, equipment, and packaging partners together.'] };
  const [riceQty, setRiceQty] = useState('');
  const riceOptions = data.stock.filter((item) => item.group === 'Milled rice');
  const riceAvailable = riceOptions.find((item) => item.id === document?.getElementById('rice-select')?.value)?.qty;
  const bagSize = Number(document?.getElementById('bag-size')?.value || 25);
  const estimatedBags = Math.floor((Number(riceQty || 0) * 1000) / bagSize);

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><span className="modal-kicker">KUMBUK MILL · NEW ENTRY</span><h2 id="modal-title">{labels[type][0]}</h2><p>{labels[type][1]}</p></div><button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></header><form className="entry-form" onSubmit={onSave}>
    {type === 'receive' && <><Field label="Supplier"><select name="supplier" required defaultValue=""><option value="" disabled>Select supplier</option>{data.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} · {supplier.type}</option>)}</select></Field><Field label="Stock item"><select name="item" required defaultValue=""><option value="" disabled>Select item</option>{data.stock.filter((item) => item.group === 'Paddy' || item.group === 'Packaging').map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select></Field><div className="form-row"><Field label="Quantity"><input type="number" name="qty" min="0.01" step="0.01" required placeholder="0.00" /></Field><Field label="Total value (LKR)"><input type="number" name="amount" min="0" step="1" required placeholder="0" /></Field></div><Field label="Paid now (LKR)"><input type="number" name="paid" min="0" step="1" defaultValue="0" /></Field></>}
    {type === 'milling' && <><Field label="Paddy to mill"><div className="input-suffix"><input type="number" name="paddy" min="0.01" max={data.stock.find((item) => item.id === 'paddy')?.qty || 0} step="0.01" required placeholder="0.00" /><span>tonnes</span></div><small>Available: {number(data.stock.find((item) => item.id === 'paddy')?.qty || 0)} t</small></Field><Field label="Rice material produced"><select name="product" required defaultValue=""> <option value="" disabled>Select rice type</option>{riceOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><div className="form-row"><Field label="Rice output"><div className="input-suffix"><input type="number" name="output" min="0.01" step="0.01" required placeholder="0.00" /><span>tonnes</span></div></Field><Field label="Batch date"><input type="date" name="date" defaultValue={today()} required /></Field></div><div className="form-note"><Factory size={16} /> Byproduct is estimated as the paddy input minus rice output.</div></>}
    {type === 'pack' && <><Field label="Rice material"><select id="rice-select" name="rice" required defaultValue=""> <option value="" disabled>Select rice type</option>{riceOptions.map((item) => <option key={item.id} value={item.id}>{item.name} · {number(item.qty)} t available</option>)}</select></Field><div className="form-row"><Field label="Rice to pack"><div className="input-suffix"><input type="number" name="riceQty" min="0.025" step="0.025" max={riceAvailable || undefined} required placeholder="0.00" value={riceQty} onChange={(event) => setRiceQty(event.target.value)} /><span>tonnes</span></div></Field><Field label="Bag size"><select id="bag-size" name="bagSize" defaultValue="25" onChange={() => {}}><option value="5">5 kg</option><option value="10">10 kg</option><option value="25">25 kg</option><option value="50">50 kg</option></select></Field></div><div className="pack-estimate"><span>Estimated finished bags</span><strong>{number(estimatedBags, 0)} bags</strong></div><div className="form-note"><Package size={16} /> Current bag stock: {number(data.stock.find((item) => item.id === 'bags')?.qty || 0, 0)} bags</div></>}
    {type === 'sale' && <><Field label="Seller / buyer"><input name="buyer" required placeholder="Business or seller name" /></Field><Field label="Product sold"><select name="item" required defaultValue=""><option value="" disabled>Select inventory item</option>{data.stock.filter((item) => item.group === 'Packed goods' || item.group === 'Milled rice').map((item) => <option key={item.id} value={item.id}>{item.name} · {number(item.qty, item.unit === 't' ? 1 : 0)} {item.unit}</option>)}</select></Field><div className="form-row"><Field label="Quantity"><input type="number" name="qty" min="0.01" step="0.01" required placeholder="0.00" /></Field><Field label="Invoice total (LKR)"><input type="number" name="amount" min="1" step="1" required placeholder="0" /></Field></div><div className="form-row"><Field label="Payment status"><select name="status" defaultValue="Credit"><option>Paid</option><option>Credit</option></select></Field><Field label="Invoice date"><input type="date" name="date" defaultValue={today()} required /></Field></div></>}
    {type === 'expense' && <><Field label="Expense description"><input name="description" required placeholder="e.g. Mill electricity" /></Field><div className="form-row"><Field label="Account"><select name="account"><option>Utilities</option><option>Wages</option><option>Repairs & maintenance</option><option>Transport</option><option>Other operating expense</option></select></Field><Field label="Amount (LKR)"><input type="number" name="amount" min="1" step="1" required placeholder="0" /></Field></div><div className="form-note"><CircleDollarSign size={16} /> This entry is recorded as an operating expense.</div></>}
    {type === 'supplier' && <><Field label="Supplier name"><input name="name" required placeholder="Business or supplier name" /></Field><Field label="Supply type"><select name="type"><option>Paddy</option><option>Equipment</option><option>Bags & packaging</option></select></Field><div className="form-row"><Field label="Contact number"><input name="contact" placeholder="Phone number" /></Field><Field label="Location"><input name="location" placeholder="Town or district" /></Field></div></>}
    <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Plus size={16} /> Save entry</button></div>
  </form></section></div>;
}

function Field({ label, children }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

export default App;