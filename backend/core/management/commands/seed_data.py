"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from menu.models import Category, MenuItem
from tables.models import Table
from orders.models import Order, OrderItem
from restaurant.models import RestaurantInfo
from loyalty.models import LoyaltyReward


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
            info.description = "Gastronomia com tecnologia."
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

        # ── Menu Items ───────────────────────────────────────────────────
        items_data = [
            {"name": "Bruschetta de Tomate", "category": "Entradas", "price": 28.00, "emoji": "🥖", "status": "available"},
            {"name": "Bife Ancho com Fritas", "category": "Pratos Principais", "price": 65.00, "emoji": "🥩", "status": "available"},
            {"name": "Salmao Grelhado", "category": "Pratos Principais", "price": 78.00, "emoji": "🐟", "status": "available"},
            {"name": "Risoto de Cogumelos", "category": "Pratos Principais", "price": 55.00, "emoji": "🍄", "status": "available"},
            {"name": "Hamburguer Artesanal", "category": "Pratos Principais", "price": 35.00, "emoji": "🍔", "status": "available"},
            {"name": "Pizza Marguerita", "category": "Pratos Principais", "price": 48.00, "emoji": "🍕", "status": "available"},
            {"name": "Suco de Laranja Natural", "category": "Bebidas", "price": 12.00, "emoji": "🍊", "status": "available"},
            {"name": "Cerveja Artesanal IPA", "category": "Bebidas", "price": 22.00, "emoji": "🍺", "status": "low_stock"},
            {"name": "Refrigerante 2L", "category": "Bebidas", "price": 14.00, "emoji": "🥤", "status": "available"},
            {"name": "Agua Mineral", "category": "Bebidas", "price": 6.00, "emoji": "💧", "status": "available"},
            {"name": "Cafe Expresso", "category": "Bebidas", "price": 8.00, "emoji": "☕", "status": "available"},
            {"name": "Pudim de Leite", "category": "Sobremesas", "price": 18.00, "emoji": "🍮", "status": "available"},
            {"name": "Petit Gateau", "category": "Sobremesas", "price": 25.00, "emoji": "🍫", "status": "available"},
        ]

        menu_items = {}
        for item_data in items_data:
            cat = categories[item_data.pop("category")]
            item, created = MenuItem.objects.get_or_create(
                name=item_data["name"],
                defaults={**item_data, "category": cat},
            )
            menu_items[item.name] = item
            if created:
                self.stdout.write(f"  Item: {item.name}")

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
            OrderItem.objects.create(order=order1, menu_item=menu_items["Hamburguer Artesanal"], quantity=2, price=35.00)
            OrderItem.objects.create(order=order1, menu_item=menu_items["Suco de Laranja Natural"], quantity=1, price=12.00)
            order1.recalculate_total()

            table2 = Table.objects.get(number=2)
            order2 = Order.objects.create(table=table2, origin=Order.Origin.TABLE, status=Order.Status.NEW)
            OrderItem.objects.create(order=order2, menu_item=menu_items["Risoto de Cogumelos"], quantity=1, price=55.00)
            OrderItem.objects.create(order=order2, menu_item=menu_items["Cerveja Artesanal IPA"], quantity=2, price=22.00)
            order2.recalculate_total()

            order3 = Order.objects.create(origin=Order.Origin.DELIVERY, status=Order.Status.NEW)
            OrderItem.objects.create(order=order3, menu_item=menu_items["Pizza Marguerita"], quantity=1, price=48.00)
            OrderItem.objects.create(order=order3, menu_item=menu_items["Refrigerante 2L"], quantity=1, price=14.00)
            order3.recalculate_total()

            table8 = Table.objects.get(number=8)
            order4 = Order.objects.create(table=table8, origin=Order.Origin.TABLE, status=Order.Status.READY)
            OrderItem.objects.create(order=order4, menu_item=menu_items["Salmao Grelhado"], quantity=1, price=78.00)
            OrderItem.objects.create(order=order4, menu_item=menu_items["Agua Mineral"], quantity=2, price=6.00)
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

        self.stdout.write(self.style.SUCCESS("\nSeed completo!"))
