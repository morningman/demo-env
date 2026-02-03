# Schema Registry BASIC Authentication Setup

By default, Schema Registry BASIC authentication is disabled to simplify initial setup. If you need to enable BASIC authentication, please follow these steps.

## Current Configuration

Schema Registry is currently configured for:
- No authentication access
- Connects to Kafka via Kerberos
- URL: http://schema-registry.example.com:8081

## Enable BASIC Authentication

### Step 1: Modify docker-compose.yml

In the `schema-registry` service, uncomment the following environment variables:

```yaml
schema-registry:
  environment:
    SCHEMA_REGISTRY_AUTHENTICATION_METHOD: BASIC
    SCHEMA_REGISTRY_AUTHENTICATION_ROLES: admin,developer,user
    SCHEMA_REGISTRY_AUTHENTICATION_REALM: SchemaRegistry
```

### Step 2: Configure Password File

Schema Registry uses the `password.properties` file for BASIC authentication.

File format: `username: password,role`

Configured users (in `schema-registry/password.properties`):
```
admin: admin123,admin
developer: dev123,developer
schemauser: schema123,user
```

### Step 3: Create PropertyFileLoginModule Configuration

Create `jaas.conf` in the `schema-registry/` directory:

```
SchemaRegistry {
  org.eclipse.jetty.jaas.spi.PropertyFileLoginModule required
  file="/etc/schema-registry/password.properties"
  debug="false";
};
```

### Step 4: Update SCHEMA_REGISTRY_OPTS

Add JAAS configuration in docker-compose.yml:

```yaml
SCHEMA_REGISTRY_OPTS: -Djava.security.krb5.conf=/etc/krb5.conf
  -Djava.security.auth.login.config=/etc/schema-registry/jaas.conf
```

### Step 5: Mount JAAS Configuration File

Add to schema-registry volumes:

```yaml
volumes:
  - ./schema-registry/jaas.conf:/etc/schema-registry/jaas.conf
```

### Step 6: Modify Client Code

Enable authentication in `register_schemas.py`:

```python
from requests.auth import HTTPBasicAuth

# Add auth parameter in requests call
response = requests.post(
    url,
    json=payload,
    auth=HTTPBasicAuth('admin', 'admin123'),
    headers={'Content-Type': 'application/vnd.schemaregistry.v1+json'}
)
```

### Step 7: Restart Environment

```bash
./stop.sh
./start.sh
```

## Test Authentication

Test authentication using curl:

```bash
# Without authentication (should fail)
curl http://schema-registry.example.com:8081/subjects

# With authentication (should succeed)
curl -u admin:admin123 http://schema-registry.example.com:8081/subjects
```

## Users and Roles

| Username   | Password  | Role      | Permissions                |
|------------|-----------|-----------|----------------------------|
| admin      | admin123  | admin     | Full access                |
| developer  | dev123    | developer | Read/write schemas         |
| schemauser | schema123 | user      | Read-only access           |

## Notes

1. **Security**: In production, please change default passwords
2. **HTTPS**: Consider enabling HTTPS to protect password transmission
3. **Kerberos**: Schema Registry still uses Kerberos to connect to Kafka
4. **ACL**: Can configure finer-grained access control

## Troubleshooting

If you encounter issues after enabling BASIC authentication:

1. Check password.properties file format
2. Ensure JAAS configuration file path is correct
3. View Schema Registry logs:
   ```bash
   docker logs schema-registry
   ```
4. Verify username and password are correct
5. Ensure role configuration matches

## Disable Authentication (Restore Default)

If you need to disable BASIC authentication, comment out the following lines in docker-compose.yml:

```yaml
# SCHEMA_REGISTRY_AUTHENTICATION_METHOD: BASIC
# SCHEMA_REGISTRY_AUTHENTICATION_ROLES: admin,developer,user
# SCHEMA_REGISTRY_AUTHENTICATION_REALM: SchemaRegistry
```

Then restart the environment.
