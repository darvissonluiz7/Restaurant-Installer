import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import CustomerShell from "@/components/usuario/CustomerShell";

const mockReviews = [
  { id: 1, name: "Maria S.", rating: 5, text: "Comida maravilhosa! Atendimento excelente.", date: "2 dias atrás" },
  { id: 2, name: "João P.", rating: 4, text: "Muito bom, ambiente agradável e pratos bem servidos.", date: "1 semana atrás" },
  { id: 3, name: "Ana L.", rating: 5, text: "Melhor restaurante da região. Voltarei com certeza!", date: "2 semanas atrás" },
  { id: 4, name: "Carlos M.", rating: 4, text: "Boa comida e preço justo. Recomendo o prato do dia.", date: "3 semanas atrás" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  return (
    <CustomerShell activeId="reviews" title="Avaliações" titleIcon={<Star className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Overall rating */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-primary">4.7</div>
            <div className="flex justify-center mt-2">
              <StarRating rating={5} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Baseado em 128 avaliações</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <span>96% recomendam</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>{mockReviews.length} comentários</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Avaliações Recentes</h3>
          {mockReviews.map(review => (
            <Card key={review.id} className="border-border/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{review.name}</p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </CustomerShell>
  );
}
