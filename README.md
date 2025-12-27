![NetSendo Logo](https://gregciupek.com/wp-content/uploads/2025/12/Logo-NetSendo-1700-x-500-px.png)

# n8n-nodes-netsendo

[![npm version](https://img.shields.io/npm/v/n8n-nodes-netsendo.svg?label=version)](https://www.npmjs.com/package/n8n-nodes-netsendo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n community](https://img.shields.io/badge/n8n-community%20node-orange)](https://n8n.io)
[![Current Version](https://img.shields.io/badge/release-v1.2.6-blue.svg)](https://github.com/NetSendo/n8n-nodes-netsendo/releases)

This is an n8n community node for **[NetSendo](https://netsendo.com)** – a powerful, self-hosted email & SMS marketing automation platform.

Automate your marketing workflows directly within [n8n](https://n8n.io), connecting NetSendo with thousands of other apps and services.

---

## 🚀 Features

| Feature                  | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| 📧 **Email Marketing**   | Manage subscribers, lists, and tags                            |
| 📱 **SMS Marketing**     | Send single & batch SMS with scheduling and subscriber linking |
| 🔄 **Webhook Triggers**  | React to subscriber and SMS events in real-time                |
| 📋 **Dynamic Dropdowns** | Auto-loads contact lists and subscribers with phone numbers    |

---

## 📦 Installation

### Via n8n UI (Recommended)

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-netsendo`
4. Click **Install**

### Via npm

```bash
npm install n8n-nodes-netsendo
```

### Via Docker

Add to your `docker-compose.yml`:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES=n8n-nodes-netsendo
```

---

## 🔧 Development Setup

To test the node locally before publishing:

### 1. Clone and install dependencies

```bash
git clone https://github.com/NetSendo/n8n-nodes-netsendo.git
cd n8n-nodes-netsendo
npm install
```

### 2. Build the project

```bash
npm run build
```

### 3. Link to your local n8n

```bash
# In the node project directory
npm link

# In your n8n installation directory (find with: which n8n)
cd ~/.n8n
npm link n8n-nodes-netsendo
```

### 4. Start n8n

```bash
n8n start
```

### 5. Alternative: Use n8n-node dev command

```bash
npm run dev
```

This will watch for changes and automatically rebuild.

---

## 🔐 Credentials Setup

1. In n8n, go to **Credentials > Create New**
2. Search for **NetSendo API**
3. Enter:
   - **Base URL**: Your NetSendo installation URL (e.g., `https://your-domain.com`)
   - **API Key**: Your API token from **Settings > API Keys** (format: `ns_live_...`)

> **Required permissions:**
>
> - For subscribers/lists: `subscribers:read`, `subscribers:write`, `lists:read`
> - For SMS: `sms:read`, `sms:write`
> - For triggers: `webhooks:read`, `webhooks:write`

---

## 🛠️ Operations

### ⚡ NetSendo Trigger

Start workflows automatically when events occur.

**Subscriber Events:**

- `subscriber.created` / `subscriber.updated` / `subscriber.deleted`
- `subscriber.subscribed` / `subscriber.unsubscribed` / `subscriber.bounced`
- `subscriber.tag_added` / `subscriber.tag_removed`

**SMS Events:**

- `sms.queued` – SMS message queued for sending
- `sms.sent` – SMS successfully delivered
- `sms.failed` – SMS delivery failed

---

### 📂 Resource: List

| Operation           | Description                       |
| ------------------- | --------------------------------- |
| **Get Many**        | Retrieve all contact lists        |
| **Get**             | Get a specific list by ID         |
| **Get Subscribers** | Fetch all subscribers from a list |

---

### 👤 Resource: Subscriber

| Operation        | Description                                        |
| ---------------- | -------------------------------------------------- |
| **Get Many**     | List subscribers with filters (status, pagination) |
| **Get**          | Get subscriber by ID                               |
| **Get by Email** | Find subscriber by email address                   |
| **Create**       | Add new subscriber                                 |
| **Update**       | Update subscriber data                             |
| **Delete**       | Remove subscriber (soft delete)                    |

---

### 🏷️ Resource: Tag

| Operation    | Description                 |
| ------------ | --------------------------- |
| **Get Many** | Retrieve all available tags |
| **Get**      | Get tag details by ID       |

---

### 📱 Resource: SMS

| Operation          | Description                             |
| ------------------ | --------------------------------------- |
| **Send**           | Send a single SMS message               |
| **Send Batch**     | Send SMS to a contact list or tag group |
| **Get Status**     | Check delivery status of an SMS         |
| **List Providers** | Get available SMS providers             |

**✨ Smart Features:**

- **Dynamic Subscriber Selection**: Select a contact list → get dropdown with subscribers who have phone numbers
- **Schedule SMS**: Send messages at a specific time using the Schedule At field
- **Subscriber Linking**: Link SMS to existing subscriber for tracking

**Send SMS Example:**

```json
{
	"phone_number": "+48123456789",
	"message": "Hello from NetSendo!",
	"schedule_at": "2025-01-01T10:00:00Z"
}
```

**Send Batch SMS Example:**

```json
{
	"contact_list_id": 1,
	"message": "Batch message to all subscribers"
}
```

---

## 📚 Resources

| Resource             | Link                                               |
| -------------------- | -------------------------------------------------- |
| 🌐 NetSendo Website  | [netsendo.com](https://netsendo.com)               |
| 📖 NetSendo Docs     | [docs.netsendo.com](https://docs.netsendo.com)     |
| 💻 GitHub Repository | [github.com/NetSendo](https://github.com/NetSendo) |
| 🔗 n8n Website       | [n8n.io](https://n8n.io)                           |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## 💬 Support

- 📧 Email: [grzegorzciupek@gmail.com](mailto:grzegorzciupek@gmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/NetSendo/n8n-nodes-netsendo/issues)

---

_Built with ❤️ for the NetSendo Community._
