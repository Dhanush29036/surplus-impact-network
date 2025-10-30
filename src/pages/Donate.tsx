import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const itemTypes = [
  { value: "food", label: "Food" },
  { value: "clothes", label: "Clothes" },
  { value: "books", label: "Books" },
  { value: "hygiene", label: "Hygiene Kits" },
  { value: "devices", label: "Devices" },
];

const Donate = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    item_type: "",
    item_name: "",
    quantity: "",
    unit: "items",
    description: "",
    pickup_location: "",
    expiry_date: "",
  });

  const [aiResult, setAiResult] = useState<{
    classification: string;
    freshness_score?: number;
    condition_score?: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    setClassifying(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke("classify-donation", {
          body: { image: base64Image },
        });

        if (error) throw error;

        setAiResult(data);
        setFormData(prev => ({
          ...prev,
          item_type: data.classification || prev.item_type,
        }));
        
        toast.success("AI classification complete!");
      };
    } catch (error: any) {
      console.error("Classification error:", error);
      toast.error("Classification failed. Please try again.");
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      // Upload image if present
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('donations')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('donations')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Insert donation
      const { error } = await supabase.from("donations").insert({
        donor_id: userId,
        item_type: formData.item_type,
        item_name: formData.item_name,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        pickup_location: formData.pickup_location,
        expiry_date: formData.expiry_date || null,
        image_url: imageUrl,
        classification_result: aiResult ? JSON.stringify(aiResult) : null,
        freshness_score: aiResult?.freshness_score,
        condition_score: aiResult?.condition_score,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Donation submitted successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Failed to submit donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
            Create Donation
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload an image for AI classification or fill out the details manually
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Item Photo</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <Button
                      type="button"
                      onClick={classifyImage}
                      disabled={classifying}
                      className="shadow-glow"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {classifying ? "Classifying..." : "Classify with AI"}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Click to upload</span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
              </div>
              
              {aiResult && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <p className="font-semibold text-primary mb-2">AI Classification Result:</p>
                  <p>Type: {aiResult.classification}</p>
                  {aiResult.freshness_score && (
                    <p>Freshness: {aiResult.freshness_score}%</p>
                  )}
                  {aiResult.condition_score && (
                    <p>Condition: {aiResult.condition_score}%</p>
                  )}
                  <p>Confidence: {Math.round(aiResult.confidence * 100)}%</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="item_type">Item Type *</Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, item_type: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) =>
                    setFormData({ ...formData, item_name: e.target.value })
                  }
                  placeholder="e.g., Fresh Vegetables"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="items, kg, boxes"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional details about the donation..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pickup_location">Pickup Location *</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_location: e.target.value })
                }
                placeholder="123 Main St, City"
                required
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Expiry Date (if applicable)</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full shadow-glow">
              {loading ? "Submitting..." : "Submit Donation"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Donate;