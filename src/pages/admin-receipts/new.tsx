
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Loader, Calendar, Save, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Mock client data for demo
const mockClients = [
  { id: "1001", name: "Golden Creations", shopName: "Golden Store", phoneNumber: "9845939045", address: "123 Gold St" },
  { id: "1002", name: "Silver Linings", shopName: "Silver Shop", phoneNumber: "9080705040", address: "456 Silver Ave" },
  { id: "1003", name: "Gem Masters", shopName: "Gem World", phoneNumber: "9845939045", address: "789 Gem Blvd" },
  { id: "1004", name: "Platinum Plus", shopName: "Platinum Gallery", phoneNumber: "8090847974", address: "101 Platinum Rd" },
  { id: "1005", name: "Diamond Designs", shopName: "Diamond Hub", phoneNumber: "7070707070", address: "202 Diamond Lane" }
];

export default function NewAdminReceiptPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("given");
  const [isSubmittingGiven, setIsSubmittingGiven] = useState(false);
  const [isSubmittingReceived, setIsSubmittingReceived] = useState(false);
  const [voucherId, setVoucherId] = useState(`GA-${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Filter states
  const [shopNameFilter, setShopNameFilter] = useState("");
  const [clientNameFilter, setClientNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  
  // Given items state
  const [givenDate, setGivenDate] = useState(new Date());
  const [givenItems, setGivenItems] = useState([{
    id: uuidv4(),
    productName: "",
    pureWeight: "",
    purePercent: "",
    melting: "",
    total: 0
  }]);
  
  // Received items state
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [receivedItems, setReceivedItems] = useState([{
    id: uuidv4(),
    productName: "",
    finalOrnamentsWt: "",
    stoneWeight: "0",
    makingChargePercent: "",
    subTotal: 0,
    total: 0
  }]);
  
  // Manual calculation state
  const [manualGivenTotal, setManualGivenTotal] = useState(0);
  const [manualReceivedTotal, setManualReceivedTotal] = useState(0);
  const [operation, setOperation] = useState("subtract-given-received");
  
  // Filter clients based on all filters
  const filteredClients = mockClients.filter(client => {
    const matchesShopName = client.shopName.toLowerCase().includes(shopNameFilter.toLowerCase());
    const matchesClientName = client.name.toLowerCase().includes(clientNameFilter.toLowerCase());
    const matchesPhone = client.phoneNumber.includes(phoneFilter);
    
    return matchesShopName && matchesClientName && matchesPhone;
  });

  // Select a client and proceed to the form
  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };
  
  // Add a new given item
  const addGivenItem = () => {
    const newItem = {
      id: uuidv4(),
      productName: "",
      pureWeight: "",
      purePercent: "",
      melting: "",
      total: 0
    };
    
    setGivenItems([...givenItems, newItem]);
  };

  // Remove a given item
  const removeGivenItem = (id) => {
    if (givenItems.length > 1) {
      setGivenItems(givenItems.filter(item => item.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Cannot remove",
        description: "At least one given item is required",
      });
    }
  };

  // Update given item field
  const updateGivenItem = (id, field, value) => {
    setGivenItems(givenItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if necessary fields are provided
        if (["pureWeight", "purePercent", "melting"].includes(field)) {
          const pureWeight = parseFloat(updatedItem.pureWeight) || 0;
          const purePercent = parseFloat(updatedItem.purePercent) || 0;
          const melting = parseFloat(updatedItem.melting) || 1;
          
          // Calculate as (Pure Weight * Pure Percent) / Melting
          updatedItem.total = (pureWeight * purePercent) / melting;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Add a new received item
  const addReceivedItem = () => {
    const newItem = {
      id: uuidv4(),
      productName: "",
      finalOrnamentsWt: "",
      stoneWeight: "0",
      makingChargePercent: "",
      subTotal: 0,
      total: 0
    };
    
    setReceivedItems([...receivedItems, newItem]);
  };

  // Remove a received item
  const removeReceivedItem = (id) => {
    if (receivedItems.length > 1) {
      setReceivedItems(receivedItems.filter(item => item.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Cannot remove",
        description: "At least one received item is required",
      });
    }
  };

  // Update received item field
  const updateReceivedItem = (id, field, value) => {
    setReceivedItems(receivedItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate subtotal and total if necessary fields are provided
        if (["finalOrnamentsWt", "stoneWeight", "makingChargePercent"].includes(field)) {
          const finalOrnamentsWt = parseFloat(updatedItem.finalOrnamentsWt) || 0;
          const stoneWeight = parseFloat(updatedItem.stoneWeight) || 0;
          const makingChargePercent = parseFloat(updatedItem.makingChargePercent) || 0;
          
          // Calculate SubTotal = (finalOrnamentsWt - stoneWeight)
          updatedItem.subTotal = finalOrnamentsWt - stoneWeight;
          
          // Calculate Total = SubTotal * (makingChargePercent / 100)
          updatedItem.total = updatedItem.subTotal * (makingChargePercent / 100);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate given totals
  const givenTotals = {
    totalPureWeight: givenItems.reduce((acc, item) => {
      const pureWeight = parseFloat(item.pureWeight) || 0;
      const purePercent = parseFloat(item.purePercent) || 0;
      return acc + (pureWeight * purePercent / 100);
    }, 0),
    total: givenItems.reduce((acc, item) => acc + item.total, 0)
  };

  // Calculate received totals
  const receivedTotals = {
    totalOrnamentsWt: receivedItems.reduce((acc, item) => acc + (parseFloat(item.finalOrnamentsWt) || 0), 0),
    totalStoneWeight: receivedItems.reduce((acc, item) => acc + (parseFloat(item.stoneWeight) || 0), 0),
    totalSubTotal: receivedItems.reduce((acc, item) => acc + item.subTotal, 0),
    total: receivedItems.reduce((acc, item) => acc + item.total, 0)
  };

  // Calculate manual result
  const calculateManualResult = () => {
    switch (operation) {
      case "subtract-given-received":
        return manualGivenTotal - manualReceivedTotal;
      case "subtract-received-given":
        return manualReceivedTotal - manualGivenTotal;
      case "add":
        return manualGivenTotal + manualReceivedTotal;
      default:
        return 0;
    }
  };

  // Save Given Data
  const saveGivenData = async () => {
    setIsSubmittingGiven(true);
    
    try {
      // Validate given items
      for (const item of givenItems) {
        if (!item.productName || !item.pureWeight || !item.purePercent || !item.melting) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill all required fields for each given item",
          });
          setIsSubmittingGiven(false);
          return;
        }
      }
      
      const givenData = {
        date: givenDate,
        items: givenItems,
        totalPureWeight: givenTotals.totalPureWeight,
        total: givenTotals.total
      };
      
      console.log("Saving given data:", givenData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: "Given items saved successfully",
      });
      
      // Update manual calculation value
      setManualGivenTotal(givenTotals.total);
    } catch (error) {
      console.error("Error saving given data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save given items",
      });
    } finally {
      setIsSubmittingGiven(false);
    }
  };

  // Save Received Data
  const saveReceivedData = async () => {
    setIsSubmittingReceived(true);
    
    try {
      // Validate received items
      for (const item of receivedItems) {
        if (!item.productName || !item.finalOrnamentsWt || !item.makingChargePercent) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill all required fields for each received item",
          });
          setIsSubmittingReceived(false);
          return;
        }
      }
      
      const receivedData = {
        date: receivedDate,
        items: receivedItems,
        totalOrnamentsWt: receivedTotals.totalOrnamentsWt,
        totalStoneWeight: receivedTotals.totalStoneWeight,
        totalSubTotal: receivedTotals.totalSubTotal,
        total: receivedTotals.total
      };
      
      console.log("Saving received data:", receivedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: "Received items saved successfully",
      });
      
      // Update manual calculation value
      setManualReceivedTotal(receivedTotals.total);
    } catch (error) {
      console.error("Error saving received data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save received items",
      });
    } finally {
      setIsSubmittingReceived(false);
    }
  };

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/admin-receipts")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Receipts
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {!selectedClient ? "Admin Receipt - Select Client" : `Admin Receipt for: ${selectedClient.name}`}
        </h1>
        <p className="text-muted-foreground">
          {selectedClient 
            ? "Manage given and received items. Data will be saved to the database once configured."
            : "Filter and select a client. Client data will be loaded from MongoDB once configured."}
        </p>
      </div>

      {!selectedClient ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Input
                  type="text"
                  placeholder="Filter by Shop Name"
                  value={shopNameFilter}
                  onChange={(e) => setShopNameFilter(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Filter by Client Name"
                  value={clientNameFilter}
                  onChange={(e) => setClientNameFilter(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Filter by Phone Number"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div key={client.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          <div>Shop: {client.shopName}</div>
                          <div>Phone: {client.phoneNumber}</div>
                          <div>Address: {client.address}</div>
                        </div>
                      </div>
                      <Button 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        onClick={() => handleSelectClient(client)}
                      >
                        Select Client
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No clients found matching the filters
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">Admin Receipt for: {selectedClient.name}</CardTitle>
                <CardDescription>Manage given and received items. Data will be saved to the database once configured.</CardDescription>
              </div>
              <div className="bg-primary/10 px-3 py-1 rounded-md text-primary font-medium">
                Voucher ID: {voucherId}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="given">Given Items</TabsTrigger>
                  <TabsTrigger value="received">Received Items</TabsTrigger>
                </TabsList>
                
                {/* Given Items Tab */}
                <TabsContent value="given" className="space-y-6 pt-4">
                  <div className="bg-card rounded-md border">
                    <div className="p-4 flex flex-col md:flex-row justify-between md:items-center border-b">
                      <h3 className="text-lg font-medium">Given Details (Client: {selectedClient.name})</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full md:w-[240px] mt-2 md:mt-0 justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {givenDate ? (
                              format(givenDate, "PPP")
                            ) : (
                              <span>Pick Given Date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={givenDate}
                            onSelect={setGivenDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="p-4 overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">S.No</th>
                            <th className="py-2 px-4 text-left">Product Name</th>
                            <th className="py-2 px-4 text-center">Pure Weight</th>
                            <th className="py-2 px-4 text-center">Pure %</th>
                            <th className="py-2 px-4 text-center">Melting</th>
                            <th className="py-2 px-4 text-center">Total</th>
                            <th className="py-2 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {givenItems.map((item, index) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-2 px-4">{index + 1}</td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.productName}
                                  onChange={(e) => updateGivenItem(item.id, "productName", e.target.value)}
                                  placeholder="E.g., Gold Bar, Old Jewellery"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.pureWeight}
                                  onChange={(e) => updateGivenItem(item.id, "pureWeight", e.target.value)}
                                  placeholder="e.g., 100.000"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.purePercent}
                                  onChange={(e) => updateGivenItem(item.id, "purePercent", e.target.value)}
                                  placeholder="e.g., 92.00"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.melting}
                                  onChange={(e) => updateGivenItem(item.id, "melting", e.target.value)}
                                  placeholder="e.g., 91.60"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4 text-center font-medium">
                                {item.total.toFixed(3)}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeGivenItem(item.id)}
                                  disabled={givenItems.length === 1}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="bg-muted/30 font-medium">
                            <td colSpan={5} className="py-2 px-4 text-right">Total:</td>
                            <td className="py-2 px-4 text-center">{givenTotals.total.toFixed(3)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-4 flex flex-col md:flex-row justify-between">
                      <Button
                        variant="outline"
                        onClick={addGivenItem}
                        className="mb-2 md:mb-0"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Given Item
                      </Button>
                      
                      <Button
                        onClick={saveGivenData}
                        disabled={isSubmittingGiven}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        {isSubmittingGiven ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Given Data
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Received Items Tab */}
                <TabsContent value="received" className="space-y-6 pt-4">
                  <div className="bg-card rounded-md border">
                    <div className="p-4 flex flex-col md:flex-row justify-between md:items-center border-b">
                      <h3 className="text-lg font-medium">Received Details (Client: {selectedClient.name})</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full md:w-[240px] mt-2 md:mt-0 justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {receivedDate ? (
                              format(receivedDate, "PPP")
                            ) : (
                              <span>Pick Received Date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={receivedDate}
                            onSelect={setReceivedDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="p-4 overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">S.No</th>
                            <th className="py-2 px-4 text-left">Product Name</th>
                            <th className="py-2 px-4 text-center">Final Ornaments (wt)</th>
                            <th className="py-2 px-4 text-center">Stone Weight</th>
                            <th className="py-2 px-4 text-center">Sub Total</th>
                            <th className="py-2 px-4 text-center">Making Charge (%)</th>
                            <th className="py-2 px-4 text-center">Total</th>
                            <th className="py-2 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedItems.map((item, index) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-2 px-4">{index + 1}</td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.productName}
                                  onChange={(e) => updateReceivedItem(item.id, "productName", e.target.value)}
                                  placeholder="E.g., New Chain, Ring"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.finalOrnamentsWt}
                                  onChange={(e) => updateReceivedItem(item.id, "finalOrnamentsWt", e.target.value)}
                                  placeholder="e.g., 50.000"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.stoneWeight}
                                  onChange={(e) => updateReceivedItem(item.id, "stoneWeight", e.target.value)}
                                  placeholder="e.g., 2.500"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4 text-center font-medium">
                                {item.subTotal.toFixed(3)}
                              </td>
                              <td className="py-2 px-4">
                                <Input
                                  value={item.makingChargePercent}
                                  onChange={(e) => updateReceivedItem(item.id, "makingChargePercent", e.target.value)}
                                  placeholder="e.g., 10.00"
                                  className="text-center"
                                />
                              </td>
                              <td className="py-2 px-4 text-center font-medium">
                                {item.total.toFixed(3)}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeReceivedItem(item.id)}
                                  disabled={receivedItems.length === 1}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="bg-muted/30 font-medium">
                            <td colSpan={2} className="py-2 px-4 text-right">Total:</td>
                            <td className="py-2 px-4 text-center">{receivedTotals.totalOrnamentsWt.toFixed(3)}</td>
                            <td className="py-2 px-4 text-center">{receivedTotals.totalStoneWeight.toFixed(3)}</td>
                            <td className="py-2 px-4 text-center">{receivedTotals.totalSubTotal.toFixed(3)}</td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 text-center">{receivedTotals.total.toFixed(3)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-4 flex flex-col md:flex-row justify-between">
                      <Button
                        variant="outline"
                        onClick={addReceivedItem}
                        className="mb-2 md:mb-0"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Received Item
                      </Button>
                      
                      <Button
                        onClick={saveReceivedData}
                        disabled={isSubmittingReceived}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        {isSubmittingReceived ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Received Data
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Manual Calculation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Comparison</CardTitle>
              <CardDescription>
                Manually input totals for comparison. This section is for on-screen calculation only and is not saved with the receipt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label htmlFor="given-total" className="text-sm font-medium">
                    Given Total
                  </label>
                  <Input
                    id="given-total"
                    type="number"
                    placeholder="Enter Given Total"
                    value={manualGivenTotal || ""}
                    onChange={(e) => setManualGivenTotal(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="operation-select" className="text-sm font-medium">
                    Operation
                  </label>
                  <select
                    id="operation-select"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  >
                    <option value="subtract-given-received">Subtract (Given - Received)</option>
                    <option value="subtract-received-given">Subtract (Received - Given)</option>
                    <option value="add">Add</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="received-total" className="text-sm font-medium">
                    Received Total
                  </label>
                  <Input
                    id="received-total"
                    type="number"
                    placeholder="Enter Received Total"
                    value={manualReceivedTotal || ""}
                    onChange={(e) => setManualReceivedTotal(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="result" className="text-sm font-medium">
                    Result
                  </label>
                  <div id="result" className="flex items-center justify-center h-10 border rounded-md bg-muted/20 px-3">
                    <span className="font-medium">{calculateManualResult().toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
