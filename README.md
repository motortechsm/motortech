# MotorTech

Sistema web da MotorTech: loja pública de módulos eletrônicos automotivos e painel administrativo privado (`/admin`).

**Status:** em desenvolvimento. Não publicado comercialmente.

## Tecnologias

- Next.js + TypeScript + Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- Mercado Pago Checkout Pro com webhook verificado
- Hospedagem: Vercel (a confirmar antes do lançamento)

## Segurança

- Nenhuma chave secreta vai para este repositório. Veja `.env.example` para a lista de variáveis.
- Valores reais ficam apenas nos painéis da Vercel e do Supabase.

## Verificação automática

A cada envio para `main`, o GitHub Actions instala as dependências, verifica os tipos e compila o site (aba **Actions**).
