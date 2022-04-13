### User
- username: String
- first_name: String
- last_name: String
- email: String
- password: String

- url: String

### Portfolio
- name: String
- owner: User[1]

- url: String

### TRANSACTION
- date: Date
- type: enum
- shares: Float
- asset: Asset[1]
- portfolio: Portfolio[1]

- url: String

### ASSET
- ticker: String

- url: String

### MARKET
- name: String
- asset: Asset[0..]

- url: String