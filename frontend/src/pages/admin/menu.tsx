import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  FolderPlus,
  Package,
  AlertTriangle,
  ImagePlus,
  X,
  Sparkles,
} from "lucide-react";
import {
  api,
  formatBRL,
  statusLabels,
  type Category,
  type MenuItemShort,
  type MenuItem,
  type PaginatedResponse,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

/* ────────────────────────────────── helpers ────────────────────────────── */

const statusClass = (status: string) => {
  if (status === "available") return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (status === "out_of_stock") return "bg-red-500/20 text-red-700 dark:text-red-400";
  return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
};

interface ItemForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  status: string;
  is_active: boolean;
  imageFile: File | null;
  imagePreview: string | null; // URL for preview (existing or blob)
}

const emptyItemForm: ItemForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  status: "available",
  is_active: true,
  imageFile: null,
  imagePreview: null,
};

/* ═══════════════════════════════ Component ═══════════════════════════════ */

export default function Menu() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── dialogs ──
  const [itemOpen, setItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemForm>(emptyItemForm);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItemShort | null>(null);

  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id?: string; name: string; display_order: number }>({ name: "", display_order: 0 });
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);

  // ── queries ──
  const { data: categoriesData } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["/api/categories/"],
    queryFn: api.getCategories,
  });

  const { data: itemsData, isLoading } = useQuery<PaginatedResponse<MenuItemShort>>({
    queryKey: ["/api/menu-items/", { search, active_only: "false" }],
    queryFn: () => api.getMenuItems({ search, active_only: "false" }),
  });

  const categories = categoriesData?.results ?? [];
  const items = itemsData?.results ?? [];
  const tabNames = ["Todos", ...categories.map((c) => c.name)];

  // ── mutations ──
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["/api/menu-items/"] });
    qc.invalidateQueries({ queryKey: ["/api/categories/"] });
  };

  const saveCatMutation = useMutation({
    mutationFn: (d: { id?: string; name: string; display_order: number }) =>
      d.id ? api.updateCategory(d.id, { name: d.name, display_order: d.display_order }) : api.createCategory({ name: d.name, display_order: d.display_order }),
    onSuccess: () => { invalidate(); setCatOpen(false); toast({ title: "Categoria salva!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteCatMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => { invalidate(); setDeleteCatTarget(null); toast({ title: "Categoria removida!" }); },
    onError: (e: Error) => toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" }),
  });

  const saveItemMutation = useMutation({
    mutationFn: (d: ItemForm) => {
      const fd = new FormData();
      fd.append("name", d.name);
      fd.append("description", d.description);
      fd.append("price", d.price);
      fd.append("category", d.category);
      fd.append("status", d.status);
      fd.append("is_active", d.is_active ? "true" : "false");
      if (d.imageFile) {
        fd.append("image", d.imageFile);
      }
      return d.id ? api.updateMenuItem(d.id, fd) : api.createMenuItem(fd);
    },
    onSuccess: () => { invalidate(); setItemOpen(false); toast({ title: "Produto salvo!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: api.deleteMenuItem,
    onSuccess: () => { invalidate(); setDeleteItemTarget(null); toast({ title: "Produto removido!" }); },
    onError: (e: Error) => toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" }),
  });

  const [aiLoading, setAiLoading] = useState(false);
  const handleAiGenerate = async () => {
    if (!editingItem.name.trim()) {
      toast({ title: "Digite o nome do prato primeiro.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const result = await api.aiGenerateDish(editingItem.name);
      setEditingItem((prev) => ({
        ...prev,
        description: result.description || prev.description,
        price: result.price || prev.price,
      }));
      toast({ title: "IA preencheu os campos!" });
    } catch {
      toast({ title: "Erro ao gerar com IA", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  // ── handlers ──
  const openNewItem = () => {
    setEditingItem({ ...emptyItemForm, category: categories[0]?.id ?? "" });
    setItemOpen(true);
  };

  const openEditItem = (item: MenuItemShort) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      status: item.status,
      description: item.description ?? "",
      is_active: item.is_active ?? true,
      imageFile: null,
      imagePreview: item.image || null,
    });
    setItemOpen(true);
  };

  const openNewCat = () => { setEditingCat({ name: "", display_order: categories.length }); setCatOpen(true); };
  const openEditCat = (c: Category) => { setEditingCat({ id: c.id, name: c.name, display_order: c.display_order }); setCatOpen(true); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingItem({
      ...editingItem,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  const removeImage = () => {
    setEditingItem({ ...editingItem, imageFile: null, imagePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    saveItemMutation.mutate(editingItem);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    saveCatMutation.mutate(editingCat);
  };

  /* ═══════════════════════════════ Render ════════════════════════════════ */

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Cardápio</h1>
          <p className="text-muted-foreground mt-1">Gerencie categorias, pratos, preços e disponibilidade.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar no cardápio..." className="pl-9 w-[220px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" onClick={openNewCat}>
            <FolderPlus className="w-4 h-4 mr-2" /> Categoria
          </Button>
          <Button className="bg-primary text-primary-foreground" onClick={openNewItem} disabled={categories.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Produto
          </Button>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!isLoading && categories.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cardápio vazio</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Comece criando uma categoria (ex: Pratos Principais, Bebidas) e depois adicione os produtos do seu restaurante.
            </p>
            <Button onClick={openNewCat}>
              <FolderPlus className="w-4 h-4 mr-2" /> Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Category chips (editable) ─────────────────────────────── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm bg-secondary/50 hover:border-primary/40 transition-colors group"
            >
              <span className="font-medium">{c.name}</span>
              <button
                className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => openEditCat(c)}
                title="Editar categoria"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setDeleteCatTarget(c)}
                title="Excluir categoria"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Items grid ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categories.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 overflow-x-auto flex-wrap h-auto p-1 bg-secondary/50">
            {tabNames.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabNames.map((cat) => {
            const filtered = cat === "Todos" ? items : items.filter((i) => i.category_name === cat);
            return (
              <TabsContent key={cat} value={cat} className="m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((item) => (
                    <Card key={item.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors group">
                      <CardContent className="p-0">
                        <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                              <ImagePlus className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${statusClass(item.status)}`}>
                              {statusLabels[item.status] || item.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold leading-tight">{item.name}</h3>
                            <span className="font-bold text-primary whitespace-nowrap">{formatBRL(item.price)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">{item.category_name}</p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => openEditItem(item)}>
                              <Edit2 className="w-3 h-3 mr-1" /> Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0 text-destructive hover:bg-destructive hover:text-white shrink-0"
                              onClick={() => setDeleteItemTarget(item)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add item placeholder card */}
                  <Card
                    className="border-2 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer group/add overflow-hidden"
                    onClick={openNewItem}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] flex flex-col items-center justify-center text-muted-foreground group-hover/add:text-primary transition-colors min-h-[200px]">
                        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium">Adicionar Produto</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Nenhum item encontrado.</p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : null}

      {/* ═══════════════════════ DIALOGS ═══════════════════════════════ */}

      {/* ── Create / Edit Item ────────────────────────────────────── */}
      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editingItem.id ? "Altere os dados do produto abaixo." : "Preencha os dados para cadastrar um novo produto."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            {/* ── Image upload ── */}
            <div className="space-y-2">
              <Label>Foto do Produto</Label>
              <div className="flex items-center gap-4">
                {editingItem.imagePreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border shrink-0">
                    <img src={editingItem.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Adicionar</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>Formatos: JPG, PNG, WebP</p>
                  <p>Tamanho recomendado: 800x600px</p>
                  {editingItem.imagePreview && (
                    <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                      Trocar foto
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-name">Nome do Produto</Label>
              <div className="flex gap-2">
                <Input
                  id="item-name"
                  placeholder="Ex: Filé Mignon ao Molho Madeira"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="shrink-0 gap-1 text-purple-600 border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Gerando..." : "Gerar com IA"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-desc">Descrição</Label>
              <Textarea
                id="item-desc"
                placeholder="Breve descrição do prato..."
                rows={2}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-price">Preço (R$)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(v) => setEditingItem({ ...editingItem, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingItem.status}
                  onValueChange={(v) => setEditingItem({ ...editingItem, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="low_stock">Pouco Estoque</SelectItem>
                    <SelectItem value="out_of_stock">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1 gap-3">
                <Switch
                  id="item-active"
                  checked={editingItem.is_active}
                  onCheckedChange={(v) => setEditingItem({ ...editingItem, is_active: v })}
                />
                <Label htmlFor="item-active" className="cursor-pointer">Ativo no cardápio</Label>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={saveItemMutation.isPending} className="w-full">
                {saveItemMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem.id ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Item Confirmation ──────────────────────────────── */}
      <Dialog open={!!deleteItemTarget} onOpenChange={() => setDeleteItemTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Excluir "{deleteItemTarget?.name}"?</DialogTitle>
            <DialogDescription>
              Este produto será removido permanentemente do cardápio.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteItemTarget && deleteItemMutation.mutate(deleteItemTarget.id)}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {deleteItemMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setDeleteItemTarget(null)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Category ────────────────────────────────── */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingCat.id ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCat.id ? "Altere o nome da categoria." : "Crie uma categoria para organizar seu cardápio (ex: Pratos Principais, Bebidas, Sobremesas)."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCat} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome da Categoria</Label>
              <Input
                id="cat-name"
                placeholder="Ex: Pratos Principais"
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Ordem de exibição</Label>
              <Input
                id="cat-order"
                type="number"
                min="0"
                value={editingCat.display_order}
                onChange={(e) => setEditingCat({ ...editingCat, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button type="submit" disabled={saveCatMutation.isPending} className="w-full">
              {saveCatMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCat.id ? "Salvar Categoria" : "Criar Categoria"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Category Confirmation ──────────────────────────── */}
      <Dialog open={!!deleteCatTarget} onOpenChange={() => setDeleteCatTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Excluir categoria "{deleteCatTarget?.name}"?
            </DialogTitle>
            <DialogDescription>
              Só é possível excluir categorias que não possuem produtos vinculados. Se houver produtos, remova-os primeiro.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteCatTarget && deleteCatMutation.mutate(deleteCatTarget.id)}
              disabled={deleteCatMutation.isPending}
            >
              {deleteCatMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {deleteCatMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setDeleteCatTarget(null)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}