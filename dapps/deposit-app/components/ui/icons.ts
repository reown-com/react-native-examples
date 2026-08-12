/**
 * Icon aliases. lucide-react-native v1 renamed several icons the prototype used
 * (Home → House, BarChart3 → ChartColumn, Loader2 → LoaderCircle). Re-exporting
 * under the prototype's names keeps the screen code reading like the original
 * JSX and gives us a single place to remap if the icon set changes again.
 */
export {
  House as Home,
  Wallet,
  ChartColumn as BarChart3,
  Settings,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  LoaderCircle as Loader2,
  Copy,
  Search,
  Building2,
} from 'lucide-react-native';
