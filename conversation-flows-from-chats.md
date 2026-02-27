# Guru Soluciones — Real Conversation Flows
> Extracted from Leandro's actual WhatsApp chats (Feb 2026)

## Flow 1: Certificate Request (Lic. Alberto Gonzalez)
**Service**: Certificado de Buena Conducta / Certificado del Ministerio Público
**Pattern**: Client requests document → Guru asks purpose → Client specifies → Guru upsells (apostille) → Client confirms → Guru gives pricing + greeting

```
CLIENT: Un papel de buena conducta
CLIENT: Solicitamele a esta persona
GURU: Buenas tardes!!
GURU: Te gustaría sea uno emitido por el ministerio publico con firmas y que pueda ser util para apostilla?
GURU: · Para que fines te gustaría el CERTIFICADO?
CLIENT: Que se pueda usar en cual quier escenario
GURU: Excelente
GURU: Primero que nada, como se encuentra en esta mañana?
GURU: Recuerde el impuesto de dicho CERTIFICADO ha aumentado a la tasa de RD$ 800
CLIENT: Si cuanto es todo
CLIENT: Con lo tuyo
```

### Key patterns:
- Greeting AFTER understanding the request (not before)
- Upsell: basic cert → apostille-ready cert
- Price transparency: mention tax/rate changes
- Personal touch: "cómo se encuentra?"
- Client wants total including Guru's fee ("con lo tuyo")

---

## Flow 2: Document Printing (ManuelGonzalez)
**Service**: Impresión de documentos legales
**Pattern**: Client sends photos of documents → Guru greets warmly → asks what they need → Client says print → Guru asks color preference

```
CLIENT: [sends 4+ photos of legal documents]
GURU: Buenas hermano querido
GURU: Para servirle, cuenteme como le podemos ayudar?
CLIENT: Para imprimirlo eso qye le envió
GURU: Excelente!!
GURU: Le gustaria a COLOR o a BLANCO y NEGRO?
CLIENT: Blanco y Negro
```

### Key patterns:
- Can receive document images (bot must handle media)
- Warm, Dominican-style greeting ("hermano querido")
- Quick service classification: what do you need? → print → options
- Bold formatting for options: **COLOR** o **BLANCO y NEGRO**

---

## Flow 3: Legal Service Inquiry + Pricing (Elia Sanchez)
**Service**: Acto de Unión Libre / Notaría
**Pattern**: Follow-up from previous day → New inquiry about specific legal document → Guru classifies service type → Gives pricing

```
GURU: Buenas tardes!
GURU: Ya casi estamos al cerrar, pero puede pasar por nuestras instalaciones el dia de mañana, que le parece?
CLIENT: Manana
[Next day]
CLIENT: Leo
CLIENT: Cuanto me Cuesta UN acto de union libre
GURU: Buenas tardes!!!
GURU: Podemos ayudarle en lo que buscas, pero primero me gustaria preguntar, te gustaria la REDACCION o ambos servicios como REDACCION + NOTARIZACION?
[Client quotes earlier message about pricing]
GURU: De momento, una notariada te puede costar alrededor de RD$ 1,500!
```

### Key patterns:
- Multi-day conversation continuity
- Client calls Leandro by name ("Leo") — personal relationship
- Service branching: REDACCIÓN vs REDACCIÓN + NOTARIZACIÓN
- Approximate pricing: "alrededor de RD$ 1,500"
- Bold for service names: **REDACCION**, **NOTARIZACION**

---

## Common Bot Behavior to Implement:

### Greeting Style:
- "Buenas tardes!!" / "Buenas tardes!!!" (multiple exclamation marks)
- "Excelente!!" after client confirms
- Personal: "hermano querido", "como se encuentra?"
- Dominican warmth, not corporate

### Service Classification Flow:
1. Client states need (sometimes vague)
2. Bot asks clarifying question with **BOLD** options
3. Client picks
4. Bot gives pricing with "RD$" format
5. Bot confirms next steps

### Formatting:
- **BOLD** for service names and options
- "·" bullet point for sub-questions
- RD$ for all prices
- "!" and "!!" for enthusiasm

### Services Catalog (from chats):
- Certificados (Buena Conducta, Ministerio Público, Apostilla)
- Impresión de documentos (Color / B&N)
- Actos notariales (Unión Libre, Poder, etc.)
- Redacción legal
- Notarización
- Combined services (Redacción + Notarización)
