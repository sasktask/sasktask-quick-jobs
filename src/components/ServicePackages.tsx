import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, DollarSign, Check } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  estimated_hours: number | null;
  includes: string[];
  tasker_id: string;
}

interface ServicePackagesProps {
  taskerId: string;
}

export const ServicePackages = ({ taskerId }: ServicePackagesProps) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, [taskerId]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('tasker_id', taskerId)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
    } else if (data) {
      setPackages(data);
    }
    setLoading(false);
  };

  const handleBookPackage = (pkg: ServicePackage) => {
    // Navigate to task posting with pre-filled data
    navigate('/post-task', {
      state: {
        prefillData: {
          title: pkg.title,
          description: pkg.description,
          category: pkg.category,
          pay_amount: pkg.price,
          preferred_tasker_id: taskerId
        }
      }
    });
  };

  if (loading) return null;
  if (packages.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Service Packages</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{pkg.title}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {pkg.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${pkg.price}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="mb-4">{pkg.description}</CardDescription>
              {pkg.estimated_hours && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Clock className="w-4 h-4" />
                  <span>~{pkg.estimated_hours} hours</span>
                </div>
              )}
              {pkg.includes && pkg.includes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Includes:</p>
                  <ul className="space-y-1">
                    {pkg.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleBookPackage(pkg)} className="w-full">
                Book This Package
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};