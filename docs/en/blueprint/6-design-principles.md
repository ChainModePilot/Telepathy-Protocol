# Chapter 6: Design Principles

TP's design revolves around five core principles. These principles not only guide the technical design of the protocol itself but also define the behavioral standards that all participants in the TP ecosystem should follow.

### 6.1 Shared Cognition Over Message Passing

TP's primary design principle is: **whenever possible, prioritize establishing a shared cognitive space over relying on serialized message transmission**. The message passing model introduces encoding loss, transmission latency, and semantic ambiguity in every round of interaction; the shared cognition model lets collaborating parties directly access the same cognitive resources, fundamentally eliminating the friction of information transfer. This principle does not deny the value of message passing — establishing the shared space itself requires message negotiation — but it clearly defines TP's design direction: minimize unnecessary serialization and deserialization.

> **Real-world example**: Two Fays collaborate on processing a traffic accident insurance claim. Under the message passing model, the insurance Fay needs to send the complete accident report, photos, vehicle information, and policy details to the assessment Fay... each round of communication involves packaging and transmitting large volumes of data. Under the shared cognition model, both parties establish a shared context where the accident report, photos, and policy information are mounted in the shared space. The assessment Fay views and annotates directly in the shared space, and the insurance Fay sees the annotation results in real time — the entire process is like two claims adjusters sitting at the same desk reviewing the same case file.

### 6.2 Transport Agnosticism

TP focuses on the **semantic layer**, not the transport layer. TP messages can be delivered through A2A's JSON-RPC, MCP's tool call, traditional REST APIs, or even natural language Prompts. This principle ensures that TP is not bound to any single underlying protocol; when new transport methods emerge, TP only needs to add a transport adapter without modifying the protocol's own semantic definitions. Transport agnosticism also means TP inherently possesses forward compatibility — it can adapt to transport protocols that have not yet been invented.

> **Real-world example**: An enterprise Fay running in the cloud needs to communicate with a Fay running on an edge device (such as a factory sensor gateway). The cloud Fay natively supports A2A, but the edge device only has a simple REST API. TP's transport agnosticism lets both parties communicate without worrying about each other's transport capabilities — TP adapts automatically, and the intent sent by the cloud Fay via A2A is transparently translated into a REST API call delivered to the edge device.

### 6.3 Adaptive Protocol Negotiation

In a heterogeneous AI ecosystem, different Fays may "speak" different protocol languages. TP does not require all participants to use a unified transport protocol; instead, through an **adaptive negotiation and translation mechanism**, it enables Fays with different "native languages" to communicate seamlessly. The negotiation process includes three steps — capability probing, contract negotiation, and semantic mapping — ensuring that intent is not lost during cross-protocol translation. This principle lowers the entry barrier to the TP ecosystem — any Fay that supports at least one transport method can participate in TP communication.

> **Real-world example**: A multinational company's HR Fay needs to interface with social security agency coFays in different countries. The US social security coFay uses A2A, Japan's uses MCP tool call, and the EU's uses REST API. The HR Fay doesn't need to write different integration code for each country — TP automatically probes the counterpart's protocol capabilities during session establishment, negotiates a transport method both sides support, and all subsequent communication is completely transparent.

### 6.4 Host-Sovereign Privacy

In the iFay worldview, every Fay acts on behalf of a Host. Therefore, **the Host has absolute sovereignty over their data**. A Fay cannot unilaterally decide which cognitive resources to share — every data disclosure must occur within the boundaries pre-authorized by the Host. TP ensures that Host privacy data is always protected during transmission and access through a triple mechanism of end-to-end encryption, selective disclosure (SelectiveDisclosure), and time-limited callback credentials (CallbackCredential). The Host can revoke authorization at any time, terminating data sharing.

> **Real-world example**: A user's iFay applies for a loan from a bank coFay on their behalf. The bank needs to review the user's income proof and credit history, but the user does not want the bank to see their spending details and investment portfolio. The user explicitly specifies during authorization that "only the past 12 months of salary statements and credit score may be disclosed," and the iFay exposes only these two items through the selective disclosure mechanism. After the loan approval is complete, the callback credential automatically expires, and the bank coFay can no longer access any user data. If the user changes their mind midway, they can revoke authorization at any time, immediately terminating data sharing.

### 6.5 Auditable Trust Boundaries

Trust is not blind — it must be built on a verifiable foundation. TP requires that **all operations involving privacy data access, credential usage, and inter-Fay communication are auditable**. Audit records contain the operation type, participant identities, timestamps, and access scope, but do not include actual data content or credential token plaintext. The Host can review the audit log at any time to understand who accessed their data, at what time, and for what purpose. This principle ensures that trust within the TP ecosystem is transparent and traceable.

> **Real-world example**: A patient's iFay has interacted with a medical coFay, an insurance coFay, and a pharmacy coFay multiple times over the past month. The patient can open the audit log and see records like: "April 3, 14:23 — Medical coFay accessed your allergy history (authorized scope: diagnosis-related data)," "April 5, 09:15 — Insurance coFay accessed diagnosis codes and cost breakdown via callback credential (credential expired April 5, 17:00)." This is like reviewing a bank account's transaction history — every "data transaction" is documented.
