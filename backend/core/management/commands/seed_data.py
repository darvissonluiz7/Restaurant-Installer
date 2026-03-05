"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""

import os
import ssl
import urllib.request
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from menu.models import Category, MenuItem
from tables.models import Table
from orders.models import Order, OrderItem
from restaurant.models import RestaurantInfo
from loyalty.models import LoyaltyReward


def _download_image(url: str, filename: str):
    """Download an image from URL and return a Django ContentFile."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        data = resp.read()
        return ContentFile(data, name=filename)
    except Exception as exc:
        print(f"  ⚠ Falha ao baixar {filename}: {exc}")
        return None


class Command(BaseCommand):
    help = "Popula o banco de dados com dados de exemplo para o RestoPro."

    def handle(self, *args, **options):
        self.stdout.write("Criando dados de exemplo...")

        # ── Admin user ───────────────────────────────────────────────────
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@restopro.com",
                password="admin123",
                first_name="Admin",
                last_name="RestoPro",
            )
            self.stdout.write(self.style.SUCCESS("  admin criado (admin / admin123)"))
        else:
            self.stdout.write("  - Usuario admin ja existe, pulando.")

        # ── Restaurant Info ──────────────────────────────────────────────
        info = RestaurantInfo.get()
        if not info.phone:
            info.name = "RestoPro"
            info.description = "O melhor da culinária brasileira com tecnologia."
            info.phone = "(11) 9999-9999"
            info.whatsapp = "(11) 9999-9999"
            info.email = "contato@restopro.com"
            info.instagram = "@restopro"
            info.facebook = "/restopro"
            info.website = "www.restopro.com"
            info.address_street = "Rua Exemplo, 123 - Centro"
            info.address_city = "Sao Paulo"
            info.address_state = "SP"
            info.address_zip = "01234-567"
            info.parking_available = True
            info.opening_hours = {
                "seg_qui": {"open": "11:00", "close": "23:00"},
                "sex_sab": {"open": "11:00", "close": "00:00"},
                "dom": {"open": "11:00", "close": "22:00"},
            }
            info.save()
            self.stdout.write(self.style.SUCCESS("  Informacoes do restaurante criadas"))

        # ── Categories ───────────────────────────────────────────────────
        categories_data = [
            {"name": "Entradas", "display_order": 1},
            {"name": "Pratos Principais", "display_order": 2},
            {"name": "Bebidas", "display_order": 3},
            {"name": "Sobremesas", "display_order": 4},
        ]
        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={"display_order": cat_data["display_order"]},
            )
            categories[cat.name] = cat
            if created:
                self.stdout.write(f"  Categoria: {cat.name}")

        # ── Limpar itens antigos do cardápio ─────────────────────────────
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        MenuItem.objects.all().delete()
        self.stdout.write(self.style.WARNING("  Itens antigos removidos"))

        # ── Menu Items — Culinária Brasileira ────────────────────────────
        items_data = [
            # ─── Entradas ────────────────────────────────────────────
            {
                "name": "Coxinha",
                "description": "Massa crocante recheada com frango desfiado e catupiry, frita na hora.",
                "category": "Entradas",
                "price": 8.00,
                "emoji": "🍗",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=800&h=600&fit=crop",
                "image_name": "coxinha.jpg",
            },
            {
                "name": "Pão de Queijo",
                "description": "Tradicional pão de queijo mineiro, quentinho e macio por dentro.",
                "category": "Entradas",
                "price": 12.00,
                "emoji": "🧀",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=800&h=600&fit=crop",
                "image_name": "pao_de_queijo.jpg",
            },
            {
                "name": "Bolinho de Bacalhau",
                "description": "Bolinhos crocantes de bacalhau desfiado com batata, temperados com salsinha.",
                "category": "Entradas",
                "price": 22.00,
                "emoji": "🐟",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop",
                "image_name": "bolinho_bacalhau.jpg",
            },
            {
                "name": "Acarajé",
                "description": "Bolinho frito de feijão-fradinho recheado com vatapá e camarão seco. Sabor da Bahia!",
                "category": "Entradas",
                "price": 18.00,
                "emoji": "🫘",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=600&fit=crop",
                "image_name": "acaraje.jpg",
            },
            {
                "name": "Pastel de Carne",
                "description": "Pastel crocante recheado com carne moída temperada, frito na hora.",
                "category": "Entradas",
                "price": 10.00,
                "emoji": "🥟",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&h=600&fit=crop",
                "image_name": "pastel_carne.jpg",
            },
            # ─── Pratos Principais ───────────────────────────────────
            {
                "name": "Feijoada Completa",
                "description": "Feijoada tradicional com arroz, couve refogada, farofa, laranja e torresmo.",
                "category": "Pratos Principais",
                "price": 55.00,
                "emoji": "🫘",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1623855244183-52fd8d3ce2f7?w=800&h=600&fit=crop",
                "image_name": "feijoada.jpg",
            },
            {
                "name": "Picanha na Brasa",
                "description": "Picanha grelhada na brasa, servida com arroz, farofa, vinagrete e mandioca frita.",
                "category": "Pratos Principais",
                "price": 75.00,
                "emoji": "🥩",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop",
                "image_name": "picanha.jpg",
            },
            {
                "name": "Moqueca de Peixe",
                "description": "Peixe cozido em leite de coco, azeite de dendê, pimentões e coentro. Servida com arroz e pirão.",
                "category": "Pratos Principais",
                "price": 65.00,
                "emoji": "🐠",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&h=600&fit=crop",
                "image_name": "moqueca.jpg",
            },
            {
                "name": "Frango à Parmegiana",
                "description": "Filé de frango empanado coberto com molho de tomate e queijo gratinado, com arroz e fritas.",
                "category": "Pratos Principais",
                "price": 42.00,
                "emoji": "🍗",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop",
                "image_name": "parmegiana.jpg",
            },
            {
                "name": "Baião de Dois",
                "description": "Arroz com feijão-de-corda cozidos juntos com queijo coalho, nata e bacon. Sabor nordestino.",
                "category": "Pratos Principais",
                "price": 38.00,
                "emoji": "🍚",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
                "image_name": "baiao_de_dois.jpg",
            },
            {
                "name": "Escondidinho de Carne Seca",
                "description": "Purê de mandioca cremoso com carne seca desfiada e queijo gratinado por cima.",
                "category": "Pratos Principais",
                "price": 40.00,
                "emoji": "🥘",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop",
                "image_name": "escondidinho.jpg",
            },
            {
                "name": "Bobó de Camarão",
                "description": "Camarões cozidos em creme de mandioca com leite de coco e azeite de dendê.",
                "category": "Pratos Principais",
                "price": 68.00,
                "emoji": "🦐",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop",
                "image_name": "bobo_camarao.jpg",
            },
            {
                "name": "Strogonoff de Frango",
                "description": "Peito de frango em cubos ao molho cremoso com champignon, servido com arroz e batata palha.",
                "category": "Pratos Principais",
                "price": 36.00,
                "emoji": "🍲",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&h=600&fit=crop",
                "image_name": "strogonoff.jpg",
            },
            # ─── Bebidas ────────────────────────────────────────────
            {
                "name": "Caipirinha",
                "description": "Drink nacional: cachaça, limão, açúcar e gelo. Refrescante e marcante.",
                "category": "Bebidas",
                "price": 18.00,
                "emoji": "🍹",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&h=600&fit=crop",
                "image_name": "caipirinha.jpg",
            },
            {
                "name": "Suco de Açaí",
                "description": "Açaí puro batido, energia da Amazônia no copo.",
                "category": "Bebidas",
                "price": 16.00,
                "emoji": "🫐",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop",
                "image_name": "suco_acai.jpg",
            },
            {
                "name": "Guaraná Antarctica",
                "description": "O refrigerante brasileiro mais amado. Lata 350ml.",
                "category": "Bebidas",
                "price": 8.00,
                "emoji": "🥤",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&h=600&fit=crop",
                "image_name": "guarana.jpg",
            },
            {
                "name": "Água de Coco",
                "description": "Água de coco natural gelada. Hidratação com sabor tropical.",
                "category": "Bebidas",
                "price": 10.00,
                "emoji": "🥥",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&h=600&fit=crop",
                "image_name": "agua_coco.jpg",
            },
            {
                "name": "Cerveja Brahma 600ml",
                "description": "A número 1 do Brasil. Chopp gelado servido na garrafa 600ml.",
                "category": "Bebidas",
                "price": 14.00,
                "emoji": "🍺",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop",
                "image_name": "cerveja.jpg",
            },
            {
                "name": "Café Expresso",
                "description": "Café brasileiro forte e encorpado, servido curto.",
                "category": "Bebidas",
                "price": 7.00,
                "emoji": "☕",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&h=600&fit=crop",
                "image_name": "cafe_expresso.jpg",
            },
            {
                "name": "Suco de Maracujá",
                "description": "Suco natural de maracujá, feito na hora. Refrescante e calmante.",
                "category": "Bebidas",
                "price": 12.00,
                "emoji": "🧃",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&h=600&fit=crop",
                "image_name": "suco_maracuja.jpg",
            },
            # ─── Sobremesas ──────────────────────────────────────────
            {
                "name": "Brigadeiro Gourmet",
                "description": "Tradicional brigadeiro com chocolate belga, finalizado com granulado.",
                "category": "Sobremesas",
                "price": 12.00,
                "emoji": "🍫",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=800&h=600&fit=crop",
                "image_name": "brigadeiro.jpg",
            },
            {
                "name": "Pudim de Leite Condensado",
                "description": "Pudim cremoso de leite condensado com calda de caramelo. Receita da vovó.",
                "category": "Sobremesas",
                "price": 16.00,
                "emoji": "🍮",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800&h=600&fit=crop",
                "image_name": "pudim.jpg",
            },
            {
                "name": "Açaí na Tigela",
                "description": "Açaí batido com banana, coberto com granola, leite condensado e frutas.",
                "category": "Sobremesas",
                "price": 22.00,
                "emoji": "🍇",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop",
                "image_name": "acai_tigela.jpg",
            },
            {
                "name": "Romeu e Julieta",
                "description": "Goiabada cascão com queijo minas derretido. Clássico da culinária mineira.",
                "category": "Sobremesas",
                "price": 18.00,
                "emoji": "🧀",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&h=600&fit=crop",
                "image_name": "romeu_julieta.jpg",
            },
            {
                "name": "Bolo de Rolo",
                "description": "Finísssimas camadas de massa com goiabada. Tradição pernambucana.",
                "category": "Sobremesas",
                "price": 14.00,
                "emoji": "🍰",
                "status": "available",
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
                "image_name": "bolo_de_rolo.jpg",
            },
        ]

        self.stdout.write("  Baixando imagens dos pratos...")
        menu_items = {}
        for item_data in items_data:
            cat = categories[item_data.pop("category")]
            image_url = item_data.pop("image_url")
            image_name = item_data.pop("image_name")

            item = MenuItem.objects.create(category=cat, **item_data)

            # Baixar e salvar imagem
            img_file = _download_image(image_url, image_name)
            if img_file:
                item.image.save(image_name, img_file, save=True)
                self.stdout.write(self.style.SUCCESS(f"  ✔ {item.name} (com foto)"))
            else:
                self.stdout.write(self.style.WARNING(f"  ✔ {item.name} (sem foto)"))

            menu_items[item.name] = item

        # ── Tables ───────────────────────────────────────────────────────
        for i in range(1, 13):
            capacity = 6 if i % 3 == 0 else 4
            table, created = Table.objects.get_or_create(
                number=i, defaults={"capacity": capacity}
            )
            if created:
                self.stdout.write(f"  Mesa {i} (cap. {capacity})")

        for num in [2, 4, 8]:
            t = Table.objects.get(number=num)
            t.status = Table.Status.OCCUPIED
            t.occupied_by = 2
            t.save(update_fields=["status", "occupied_by"])

        Table.objects.filter(number=5).update(status=Table.Status.CLEANING)
        Table.objects.filter(number=10).update(status=Table.Status.RESERVED, reservation_time="19:30")

        # ── Sample Orders ────────────────────────────────────────────────
        if not Order.objects.exists():
            table4 = Table.objects.get(number=4)
            order1 = Order.objects.create(table=table4, origin=Order.Origin.TABLE, status=Order.Status.PREPARING)
            OrderItem.objects.create(order=order1, menu_item=menu_items["Feijoada Completa"], quantity=2, price=55.00)
            OrderItem.objects.create(order=order1, menu_item=menu_items["Caipirinha"], quantity=2, price=18.00)
            order1.recalculate_total()

            table2 = Table.objects.get(number=2)
            order2 = Order.objects.create(table=table2, origin=Order.Origin.TABLE, status=Order.Status.NEW)
            OrderItem.objects.create(order=order2, menu_item=menu_items["Picanha na Brasa"], quantity=1, price=75.00)
            OrderItem.objects.create(order=order2, menu_item=menu_items["Cerveja Brahma 600ml"], quantity=3, price=14.00)
            order2.recalculate_total()

            order3 = Order.objects.create(origin=Order.Origin.DELIVERY, status=Order.Status.NEW)
            OrderItem.objects.create(order=order3, menu_item=menu_items["Strogonoff de Frango"], quantity=2, price=36.00)
            OrderItem.objects.create(order=order3, menu_item=menu_items["Guaraná Antarctica"], quantity=2, price=8.00)
            order3.recalculate_total()

            table8 = Table.objects.get(number=8)
            order4 = Order.objects.create(table=table8, origin=Order.Origin.TABLE, status=Order.Status.READY)
            OrderItem.objects.create(order=order4, menu_item=menu_items["Moqueca de Peixe"], quantity=1, price=65.00)
            OrderItem.objects.create(order=order4, menu_item=menu_items["Água de Coco"], quantity=2, price=10.00)
            order4.recalculate_total()

            self.stdout.write(self.style.SUCCESS("  4 pedidos de exemplo criados"))

        # ── Loyalty Rewards ──────────────────────────────────────────────
        rewards_data = [
            {"name": "Sobremesa Gratis", "points_required": 50, "emoji": "🍰", "display_order": 1},
            {"name": "Bebida Gratis", "points_required": 100, "emoji": "🥤", "display_order": 2},
            {"name": "10% de Desconto", "points_required": 200, "emoji": "💰", "display_order": 3},
            {"name": "Prato Principal Gratis", "points_required": 500, "emoji": "🍽️", "display_order": 4},
        ]
        for r in rewards_data:
            reward, created = LoyaltyReward.objects.get_or_create(
                name=r["name"], defaults=r
            )
            if created:
                self.stdout.write(f"  Recompensa: {reward.name}")

        self.stdout.write(self.style.SUCCESS("\n🇧🇷 Seed completo com culinária brasileira!"))
