import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users, Clock, Loader2, Plus, QrCode, Trash2, Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api, formatBRL, type Table, type PaginatedResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const borderClass: Record<string, string> = {
  free: "border-green-500/20 hover:border-green-500/50",
  occupied: "border-primary shadow-sm shadow-primary/10",
  cleaning: "border-orange-400/50 bg-orange-50 dark:bg-orange-950/10",
  reserved: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/10",
};

const badgeClass: Record<string, string> = {
  free: "text-green-600 border-green-200 bg-green-50",
  cleaning: "text-orange-600 border-orange-200",
  reserved: "text-blue-600 border-blue-200",
};

function getTableUrl(tableNumber: number) {
  return `${window.location.origin}/m/${tableNumber}`;
}

export default function Tables() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [deleteTable, setDeleteTable] = useState<Table | null>(null);
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const qrRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Table>>({
    queryKey: ["/api/tables/"],
    queryFn: api.getTables,
    refetchInterval: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: api.createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/"] });
      setCreateOpen(false);
      setNewNumber("");
      setNewCapacity("4");
      toast({ title: "Mesa criada!", description: "A nova mesa foi cadastrada com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar mesa", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/"] });
      setDeleteTable(null);
      toast({ title: "Mesa removida", description: "A mesa foi excluída com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir mesa", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newNumber);
    const cap = parseInt(newCapacity);
    if (!num || num < 1) return;
    createMutation.mutate({ number: num, capacity: cap || 4 });
  };

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current || !qrTable) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 600;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 56, 24, 400, 400);
      ctx.font = "bold 36px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.fillText(`Mesa ${String(qrTable.number).padStart(2, "0")}`, 256, 480);
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#666";
      ctx.fillText("Escaneie para acessar o cardápio", 256, 520);
      const link = document.createElement("a");
      link.download = `qrcode-mesa-${qrTable.number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [qrTable]);

  const handlePrintQR = useCallback(() => {
    if (!qrTable) return;
    const win = window.open("", "_blank", "width=450,height=550");
    if (!win) return;
    const url = getTableUrl(qrTable.number);
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Mesa ${qrTable.number}</title>
        <style>
          body { margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:system-ui,sans-serif; }
          h1 { font-size:28px; margin:0 0 4px; }
          p { color:#666; font-size:14px; margin:0 0 24px; }
          .qr { margin-bottom:24px; }
          .url { font-size:11px; color:#999; word-break:break-all; max-width:350px; text-align:center; }
        </style>
      </head>
      <body>
        <h1>Mesa ${String(qrTable.number).padStart(2, "0")}</h1>
        <p>Escaneie para acessar o cardápio</p>
        <div class="qr" id="qr"></div>
        <div class="url">${url}</div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
        <script>
          var qr = qrcode(0,'M'); qr.addData('${url}'); qr.make();
          document.getElementById('qr').innerHTML = qr.createSvgTag(8, 0);
          setTimeout(function(){ window.print(); }, 400);
        </script>
      </body>
      </html>
    `);
    win.document.close();
  }, [qrTable]);

  const tables = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Mapa de Mesas</h1>
          <p className="text-muted-foreground mt-1">Gerencie a ocupação e atendimento do salão.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Livre</div>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-primary"></div> Ocupada</div>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-orange-400"></div> Limpeza</div>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Reservada</div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Nova Mesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`border-2 transition-all hover:shadow-md relative overflow-hidden ${borderClass[table.status] || ""}`}
          >
            {table.status === "occupied" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            )}

            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border/50 flex items-center justify-center bg-secondary/50">
                  <span className="font-display font-bold text-lg">{table.number}</span>
                </div>
                <Badge variant={table.status === "occupied" ? "default" : "outline"} className={badgeClass[table.status] || ""}>
                  {table.status_display}
                </Badge>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{table.occupied_by ? `${table.occupied_by}/${table.capacity}` : `Lugares: ${table.capacity}`}</span>
                  </div>
                  {table.reservation_time && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4" />
                      {table.reservation_time}
                    </div>
                  )}
                </div>

                {table.status === "occupied" && parseFloat(table.current_amount) > 0 && (
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Parcial</span>
                    <span className="font-bold text-foreground">{formatBRL(table.current_amount)}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1.5"
                    onClick={() => setQrTable(table)}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                  </Button>
                  {table.status === "free" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-white shrink-0"
                      onClick={() => setDeleteTable(table)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add table placeholder card */}
        <Card
          className="border-2 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer group"
          onClick={() => setCreateOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground group-hover:text-primary transition-colors">
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Cadastrar Mesa</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Create Table Dialog ──────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Mesa</DialogTitle>
            <DialogDescription>
              Informe o número e a capacidade da mesa. Um QR Code será gerado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="number">Número da Mesa</Label>
              <Input
                id="number"
                type="number"
                min="1"
                placeholder="Ex: 13"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (lugares)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                placeholder="4"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {createMutation.isPending ? "Criando..." : "Criar Mesa"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── QR Code Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!qrTable} onOpenChange={() => setQrTable(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              QR Code — Mesa {qrTable ? String(qrTable.number).padStart(2, "0") : ""}
            </DialogTitle>
            <DialogDescription className="text-center">
              O cliente escaneia este QR Code para acessar o cardápio digital.
            </DialogDescription>
          </DialogHeader>
          {qrTable && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl border border-border shadow-sm"
              >
                <QRCodeSVG
                  value={getTableUrl(qrTable.number)}
                  size={240}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-mono text-muted-foreground break-all px-4">
                  {getTableUrl(qrTable.number)}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PNG
                </Button>
                <Button className="flex-1" onClick={handlePrintQR}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={!!deleteTable} onOpenChange={() => setDeleteTable(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Excluir Mesa {deleteTable?.number}?</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. A mesa será removida permanentemente do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={() => deleteTable && deleteMutation.mutate(deleteTable.id)}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTable(null)} className="w-full">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}