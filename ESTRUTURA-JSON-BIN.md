# Estrutura JSON para o Bin no JSONBin.io

## Estrutura Completa

O JSON do bin deve seguir esta estrutura baseada nas mudanças do projeto:

```json
{
  "items": [],
  "groups": [],
  "costs": [],
  "goals": [],
  "version": "1.0",
  "lastUpdate": "2025-01-23T00:00:00.000Z"
}
```

## Detalhamento de Cada Campo

### 1. `items` (Array de Produtos)

Cada item pode ser de duas categorias: **"Roupas"** ou **"Eletrônicos"**

#### Item - Categoria "Roupas":
```json
{
  "id": "1234567890",
  "category": "Roupas",
  "name": "Camiseta Básica",
  "brand": "Marca X",
  "price": 49.90,
  "size": "M",
  "gender": "Unissex"
}
```

#### Item - Categoria "Eletrônicos":
```json
{
  "id": "1234567891",
  "category": "Eletrônicos",
  "name": "iPhone 14",
  "brand": "Apple",
  "price": 5999.00,
  "model": "iPhone 14",
  "capacity": "128GB",
  "color": "Preto"
}
```

**Campos obrigatórios:**
- `id`: String única (geralmente timestamp)
- `category`: "Roupas" ou "Eletrônicos"
- `name`: Nome do produto
- `brand`: Marca
- `price`: Número (preço)

**Campos opcionais para Roupas:**
- `size`: Tamanho (ex: "P", "M", "G", "42")
- `gender`: Gênero (ex: "Masculino", "Feminino", "Unissex")

**Campos opcionais para Eletrônicos:**
- `model`: Modelo (ex: "iPhone 14", "Galaxy S23")
- `capacity`: Capacidade (ex: "128GB", "256GB", "512GB")
- `color`: Cor (ex: "Preto", "Branco", "Azul")

### 2. `groups` (Array de Grupos Mensais)

Cada grupo representa um mês de vendas:

```json
{
  "id": "1234567892",
  "month": "2025-01",
  "days": [
    {
      "day": 1,
      "sales": [
        {
          "itemId": "1234567890",
          "quantity": 2,
          "price": 49.90
        }
      ],
      "stock": {
        "1234567890": 10,
        "1234567891": 5
      }
    },
    {
      "day": 2,
      "sales": [],
      "stock": {}
    }
  ]
}
```

**Campos obrigatórios:**
- `id`: String única
- `month`: String no formato "YYYY-MM" (ex: "2025-01")
- `days`: Array de objetos de dias

**Estrutura de cada `day`:**
- `day`: Número (1-31)
- `sales`: Array de vendas do dia
- `stock`: Objeto com estoque do dia (chave: itemId, valor: quantidade)

**Estrutura de cada `sale`:**
- `itemId`: ID do item vendido
- `quantity`: Quantidade vendida
- `price`: Preço unitário da venda

### 3. `costs` (Array de Custos de Compra)

```json
{
  "id": "1234567893",
  "description": "Compra de estoque inicial",
  "date": "2025-01-15",
  "items": [
    {
      "itemId": "1234567890",
      "quantity": 20,
      "unitPrice": 30.00
    }
  ],
  "total": 600.00
}
```

**Campos obrigatórios:**
- `id`: String única
- `description`: Descrição do custo
- `date`: Data no formato "YYYY-MM-DD"
- `items`: Array de itens comprados
- `total`: Valor total do custo

**Estrutura de cada item em `items`:**
- `itemId`: ID do item comprado
- `quantity`: Quantidade comprada
- `unitPrice`: Preço unitário

### 4. `goals` (Array de Metas)

```json
{
  "id": "1234567894",
  "month": "2025-01",
  "amount": 10000.00,
  "description": "Meta de vendas para janeiro"
}
```

**Campos obrigatórios:**
- `id`: String única
- `month`: String no formato "YYYY-MM"
- `amount`: Valor da meta (número)
- `description`: Descrição da meta (opcional)

### 5. Campos de Metadados

- `version`: Versão do formato de dados (atualmente "1.0")
- `lastUpdate`: Timestamp ISO da última atualização

## Exemplo Completo de Bin Vazio (Inicial)

```json
{
  "items": [],
  "groups": [],
  "costs": [],
  "goals": [],
  "version": "1.0",
  "lastUpdate": "2025-01-23T00:00:00.000Z"
}
```

## Exemplo Completo de Bin com Dados

```json
{
  "items": [
    {
      "id": "1705958400000",
      "category": "Roupas",
      "name": "Camiseta Básica",
      "brand": "Marca X",
      "price": 49.90,
      "size": "M",
      "gender": "Unissex"
    },
    {
      "id": "1705958400001",
      "category": "Eletrônicos",
      "name": "iPhone 14",
      "brand": "Apple",
      "price": 5999.00,
      "model": "iPhone 14",
      "capacity": "128GB",
      "color": "Preto"
    }
  ],
  "groups": [
    {
      "id": "1705958400002",
      "month": "2025-01",
      "days": [
        {
          "day": 1,
          "sales": [
            {
              "itemId": "1705958400000",
              "quantity": 2,
              "price": 49.90
            }
          ],
          "stock": {
            "1705958400000": 10,
            "1705958400001": 5
          }
        }
      ]
    }
  ],
  "costs": [
    {
      "id": "1705958400003",
      "description": "Compra de estoque inicial",
      "date": "2025-01-15",
      "items": [
        {
          "itemId": "1705958400000",
          "quantity": 20,
          "unitPrice": 30.00
        }
      ],
      "total": 600.00
    }
  ],
  "goals": [
    {
      "id": "1705958400004",
      "month": "2025-01",
      "amount": 10000.00,
      "description": "Meta de vendas para janeiro"
    }
  ],
  "version": "1.0",
  "lastUpdate": "2025-01-23T12:00:00.000Z"
}
```

## Como Atualizar o Bin no JSONBin.io

1. Acesse https://jsonbin.io
2. Faça login na sua conta
3. Vá em "Bins" no menu
4. Selecione o bin com ID: `6922795b43b1c97be9bf0197`
5. Clique em "Edit" ou edite diretamente o JSON
6. Cole a estrutura JSON acima (ou apenas os campos que você quer atualizar)
7. Salve as alterações

## Notas Importantes

- O campo `stock` em cada `day` é um objeto onde a chave é o `itemId` e o valor é a quantidade em estoque
- Todos os IDs devem ser strings únicas (geralmente timestamps)
- O campo `category` é obrigatório para todos os itens (padrão: "Roupas" se não especificado)
- O sistema faz migração automática de dados antigos, adicionando `category: "Roupas"` e `stock: {}` quando necessário
- O campo `goals` foi adicionado recentemente, então bins antigos podem não tê-lo (será adicionado automaticamente)

