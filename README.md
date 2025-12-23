![NetSendo Logo](https://gregciupek.com/wp-content/uploads/2025/12/Logo-NetSendo-1700-x-500-px.png)

# n8n-nodes-netsendo

This is an n8n community node for **[NetSendo](https://netsendo.com)** – a powerful, self-hosted email marketing automation platform.

This node allows you to automate your email marketing workflows directly within [n8n](https://n8n.io), connecting NetSendo with thousands of other apps and services.

---

## 🚀 Features

With the NetSendo node, you can seamlessly interact with your Netsendo instance to:

- **Manage Subscribers**: Create, update, delete, and search for subscribers.
- **Manage Lists**: Retrieve contact lists and their subscribers.
- **Manage Tags**: Access and organize your tags.
- **Dynamic Dropdowns**: Automatically loads your contact lists for easy selection.

## 📦 Installation

To install this node in your n8n instance:

1.  Go to **Settings > Community Nodes**.
2.  Select **Install**.
3.  Enter `n8n-nodes-netsendo` as the package name.
4.  Click **Install**.

Alternatively, if you are running n8n via Docker or npm, you can install it manually:

```bash
npm install n8n-nodes-netsendo
```

## 🔐 Credentials Setup

To use this node, you need to connect it to your NetSendo installation.

1.  In n8n, go to **Credentials** and click **Create New**.
2.  Search for **NetSendo API**.
3.  Enter the following details:
    - **Base URL**: The URL of your NetSendo installation (e.g., `https://premium.gregciupek.com`). _Do not include `/api/v1` at the end._
    - **API Key**: Your personal API token. You can generate this in your NetSendo dashboard under **Settings > API Keys** (format: `ns_live_...`).

## 🛠️ Operations

### 📂 Resource: List

Manage your contact lists.

- **Get Many**: Retrieve all contact lists (supports pagination and sorting).
- **Get**: Get details of a specific list by ID.
- **Get Subscribers**: Fetch all subscribers belonging to a specific list.

### 👤 Resource: Subscriber

Manage your email subscribers.

- **Get Many**: Retrieve a list of subscribers.
  - _Filters available_: Contact List, Status (Active, Inactive, etc.), Pagination, Sorting.
- **Get**: Get details of a single subscriber by ID.
- **Get by Email**: Find a subscriber using their email address.
- **Create**: Add a new subscriber.
  - _Required_: Email, Contact List.
  - _Optional_: First Name, Last Name, Phone, Status, Source, Tags.
- **Update**: Update an existing subscriber's data.
- **Delete**: Remove a subscriber (soft delete).

### 🏷️ Resource: Tag

Access your tags.

- **Get Many**: Retrieve all available tags.
- **Get**: Get details of a specific tag by ID.

## 📚 Resources

- **[NetSendo Website](https://netsendo.com)**
- **[NetSendo Repository](https://github.com/NetSendo/NetSendo/)**
- **[n8n Website](https://n8n.io)**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

_Built with ❤️ for the NetSendo Community._
