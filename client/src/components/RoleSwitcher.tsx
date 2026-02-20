import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { UserCircle, Stethoscope, ShieldCheck, ChevronDown } from 'lucide-react';

export function RoleSwitcher() {
  const { role, setRole } = useAuth();

  const getIcon = (r: string) => {
    switch(r) {
      case 'provider': return <Stethoscope className="w-4 h-4 mr-2" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 mr-2" />;
      default: return <UserCircle className="w-4 h-4 mr-2" />;
    }
  };

  const getLabel = (r: string) => {
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/50 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:text-primary transition-all duration-200"
        >
          {getIcon(role)}
          <span className="mr-2 font-medium">View as {getLabel(role)}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuItem onClick={() => setRole('customer')} className="cursor-pointer">
          <UserCircle className="w-4 h-4 mr-2 text-primary" /> Customer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole('provider')} className="cursor-pointer">
          <Stethoscope className="w-4 h-4 mr-2 text-primary" /> Provider
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole('admin')} className="cursor-pointer">
          <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
