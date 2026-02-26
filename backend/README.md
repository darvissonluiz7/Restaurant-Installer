# RestoPro — Backend Django

Backend da aplicação RestoPro (sistema de gestão de restaurante) usando **Django + Django REST Framework + PyMySQL (MySQL)**.

## Requisitos

- Python 3.11+
- MySQL 8.0+

## Setup Rápido

```bash
cd backend

# 1. Criar e ativar venv
python -m venv venv
source venv/bin/activate   # macOS/Linux

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais MySQL

# 4. Criar o banco no MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS restopro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Rodar migrations
python manage.py migrate

# 6. Popular com dados de exemplo
python manage.py seed_data

# 7. Iniciar o servidor
python manage.py runserver 8000
```

## Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login/` | Login (username + password) |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Usuário autenticado |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/` | Dados agregados do dia |

### Categorias (CRUD)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories/` | Listar |
| POST | `/api/categories/` | Criar |
| GET | `/api/categories/{id}/` | Detalhe |
| PUT | `/api/categories/{id}/` | Atualizar |
| DELETE | `/api/categories/{id}/` | Deletar |

### Itens do Cardápio (CRUD)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/menu-items/` | Listar (filtros: `?category=`, `?search=`, `?status=`, `?active_only=`) |
| POST | `/api/menu-items/` | Criar |
| GET | `/api/menu-items/{id}/` | Detalhe |
| PUT | `/api/menu-items/{id}/` | Atualizar |
| DELETE | `/api/menu-items/{id}/` | Deletar |

### Mesas (CRUD)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tables/` | Listar |
| POST | `/api/tables/` | Criar |
| PATCH | `/api/tables/{id}/update_status/` | Mudar status |

### Pedidos (CRUD)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orders/` | Listar (filtros: `?status=`, `?table=`, `?today_only=`) |
| POST | `/api/orders/` | Criar pedido (com itens inline) |
| PATCH | `/api/orders/{id}/update_status/` | Mudar status (new → preparing → ready → delivered) |
| GET | `/api/orders/by_table/?table_number=4` | Pedidos ativos de uma mesa |

### Chamadas de Garçom
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/waiter-calls/` | Listar (filtro: `?pending_only=true`) |
| PATCH | `/api/waiter-calls/{id}/acknowledge/` | Marcar como atendido |

### Endpoints do Cliente (público)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/customer/{mesa}/menu/` | Cardápio |
| POST | `/api/customer/{mesa}/order/` | Fazer pedido |
| POST | `/api/customer/{mesa}/call-waiter/` | Chamar garçom |
| POST | `/api/customer/{mesa}/request-bill/` | Pedir conta |

## Exemplo — Criar Pedido

```json
POST /api/orders/
{
  "table": "uuid-da-mesa",
  "origin": "table",
  "notes": "",
  "items": [
    { "menu_item": "uuid-do-item", "quantity": 2 },
    { "menu_item": "uuid-do-item-2", "quantity": 1 }
  ]
}
```

## Admin Django

Acesse `/admin/` com as credenciais criadas pelo `seed_data` (**admin** / **admin123**).
