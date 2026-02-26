"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Category, MenuItem, Table, Order, OrderItem


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
            self.stdout.write(self.style.SUCCESS("  ✓ Usuário admin criado (admin / admin123)"))
        else:
            self.stdout.write("  - Usuário admin já existe, pulando.")

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
                self.stdout.write(f"  ✓ Categoria: {cat.name}")

        # ── Menu Items ───────────────────────────────────────────────────
        items_data = [
            {
                "name": "Bruschetta de Tomate",
                "category": "Entradas",
                "price": 28.00,
                "emoji": "🥖",
                "status": "available",
            },
            {
                "name": "Bife Ancho com Fritas",
                "category": "Pratos Principais",
                "price": 65.00,
                "emoji": "🥩",
                "status": "available",
            },
            {
                "name": "Salmão Grelhado",
                "category": "Pratos Principais",
                "price": 78.00,
                "emoji": "🐟",
                "status": "available",
            },
            {
                "name": "Risoto de Cogumelos",
                "category": "Pratos Principais",
                "price": 55.00,
                "emoji": "🍄",
                "status": "available",
            },
            {
                "name": "Hamburguer Artesanal",
                "category": "Pratos Principais",
                "price": 35.00,
                "emoji": "🍔",
                "status": "available",
            },
            {
                "name": "Pizza Marguerita",
                "category": "Pratos Principais",
                "price": 48.00,
                "emoji": "🍕",
                "status": "available",
            },
            {
                "name": "Suco de Laranja Natural",
                "category": "Bebidas",
                "price": 12.00,
                "emoji": "🍊",
                "status": "available",
            },
            {
                "name": "Cerveja Artesanal IPA",
                "category": "Bebidas",
                "price": 22.00,
                "emoji": "🍺",
                "status": "low_stock",
            },
            {
                "name": "Refrigerante 2L",
                "category": "Bebidas",
                "price": 14.00,
                "emoji": "🥤",
                "status": "available",
            },
            {
                "name": "Água Mineral",
                "category": "Bebidas",
                "price": 6.00,
                "emoji": "💧",
                "status": "available",
            },
            {
                "name": "Café Expresso",
                "category": "Bebidas",
                "price": 8.00,
                "emoji": "☕",
                "status": "available",
            },
            {
                "name": "Pudim de Leite",
                "category": "Sobremesas",
                "price": 18.00,
                "emoji": "🍮",
                "status": "available",
            },
            {
                "name": "Petit Gâteau",
                "category": "Sobremesas",
                "price": 25.00,
                "emoji": "🍫",
                "status": "available",
            },
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
                self.stdout.write(f"  ✓ Item: {item.name}")

        # ── Tables ───────────────────────────────────────────────────────
        for i in range(1, 13):
            capacity = 6 if i % 3 == 0 else 4
            table, created = Table.objects.get_or_create(
                number=i,
                defaults={"capacity": capacity},
            )
            if created:
                self.stdout.write(f"  ✓ Mesa {i} (cap. {capacity})")

        # Ocupar algumas mesas
        for num in [2, 4, 8]:
            t = Table.objects.get(number=num)
            t.status = Table.Status.OCCUPIED
            t.occupied_by = 2
            t.save(update_fields=["status", "occupied_by"])

        Table.objects.filter(number=5).update(status=Table.Status.CLEANING)
        Table.objects.filter(number=10).update(
            status=Table.Status.RESERVED, reservation_time="19:30"
        )

        # ── Sample Orders ────────────────────────────────────────────────
        if not Order.objects.exists():
            table4 = Table.objects.get(number=4)
            order1 = Order.objects.create(
                table=table4,
                origin=Order.Origin.TABLE,
                status=Order.Status.PREPARING,
            )
            OrderItem.objects.create(
                order=order1,
                menu_item=menu_items["Hamburguer Artesanal"],
                quantity=2,
                price=35.00,
            )
            OrderItem.objects.create(
                order=order1,
                menu_item=menu_items["Suco de Laranja Natural"],
                quantity=1,
                price=12.00,
            )
            order1.recalculate_total()

            table2 = Table.objects.get(number=2)
            order2 = Order.objects.create(
                table=table2,
                origin=Order.Origin.TABLE,
                status=Order.Status.NEW,
            )
            OrderItem.objects.create(
                order=order2,
                menu_item=menu_items["Risoto de Cogumelos"],
                quantity=1,
                price=55.00,
            )
            OrderItem.objects.create(
                order=order2,
                menu_item=menu_items["Cerveja Artesanal IPA"],
                quantity=2,
                price=22.00,
            )
            order2.recalculate_total()

            order3 = Order.objects.create(
                origin=Order.Origin.DELIVERY,
                status=Order.Status.NEW,
            )
            OrderItem.objects.create(
                order=order3,
                menu_item=menu_items["Pizza Marguerita"],
                quantity=1,
                price=48.00,
            )
            OrderItem.objects.create(
                order=order3,
                menu_item=menu_items["Refrigerante 2L"],
                quantity=1,
                price=14.00,
            )
            order3.recalculate_total()

            table8 = Table.objects.get(number=8)
            order4 = Order.objects.create(
                table=table8,
                origin=Order.Origin.TABLE,
                status=Order.Status.READY,
            )
            OrderItem.objects.create(
                order=order4,
                menu_item=menu_items["Salmão Grelhado"],
                quantity=1,
                price=78.00,
            )
            OrderItem.objects.create(
                order=order4,
                menu_item=menu_items["Água Mineral"],
                quantity=2,
                price=6.00,
            )
            order4.recalculate_total()

            self.stdout.write(self.style.SUCCESS("  ✓ 4 pedidos de exemplo criados"))

        self.stdout.write(self.style.SUCCESS("\n✅  Seed completo!"))
