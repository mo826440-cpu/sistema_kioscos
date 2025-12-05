# 🔄 Shared - Código Compartido

## ¿Qué es esta carpeta?

Aquí va el **código que se usa tanto en el cliente (POS) como en el servidor (API)**.

## ¿Para qué sirve?

Cuando tenés código que necesitás en varios lugares, en vez de duplicarlo, lo ponés acá y lo importás desde donde lo necesites.

## ¿Qué contiene?

```
shared/
├── types/                 → Definiciones de tipos (TypeScript)
├── constants/             → Constantes del sistema
├── validators/            → Validaciones comunes
└── utils/                 → Funciones útiles compartidas
```

## Ejemplos de código compartido

### 1. Tipos de datos (TypeScript)

```typescript
// types/Product.ts
export interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
}
```

### 2. Constantes

```typescript
// constants/PaymentMethods.ts
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer'
};
```

### 3. Validadores

```typescript
// validators/barcodeValidator.ts
export function isValidBarcode(barcode: string): boolean {
  // Lógica de validación
  return barcode.length >= 8 && barcode.length <= 13;
}
```

### 4. Utilidades

```typescript
// utils/formatters.ts
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
```

## Ventajas

✅ **No duplicás código** → Escribís una vez, usás en varios lugares  
✅ **Fácil de mantener** → Si cambiás algo, se actualiza en todos lados  
✅ **Consistencia** → Mismas reglas en cliente y servidor  
✅ **Menos bugs** → Una sola fuente de verdad  

## Próximos pasos

En las próximas fases vamos a crear:
- Tipos TypeScript para todos los modelos
- Validadores de datos
- Utilidades de formato y cálculo
- Constantes del sistema

## Estado

🚧 **En construcción** - Fase 2 completada (estructura creada)

