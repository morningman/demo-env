#!/bin/bash

# Schema Registry Subject Management
# Usage: ./list_subjects.sh <command> [options]
# Commands: list, add, delete, get

set -e

SCHEMA_REGISTRY_URL="http://localhost:8081"
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="admin123"

# Unset proxy environment variables to avoid localhost access issues
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY no_proxy NO_PROXY 2>/dev/null || true

function print_header() {
    echo "============================================"
    echo "$1"
    echo "============================================"
}

function show_help() {
    cat << EOF
Schema Registry Subject Management

Usage: $0 <command> [options]

Commands:
  list [username] [password]
      List all subjects with details
      Default credentials: admin/admin123

  get <subject-name> [username] [password]
      Get detailed information about a specific subject
      Shows all versions and schemas

  add <subject-name> <schema-file> [username] [password]
      Register a new schema for a subject
      schema-file: Path to Avro schema JSON file

  delete <subject-name> [username] [password]
      Delete a subject and all its versions
      WARNING: This is a permanent operation!

  help
      Show this help message

Examples:
  $0 list
  $0 list developer dev123
  $0 get users-value
  $0 add users-value schemas/user.avsc
  $0 add orders-value schemas/order.avsc admin admin123
  $0 delete test-subject

Available credentials:
  - admin/admin123 (admin role)
  - developer/dev123 (developer role)
  - schemauser/schema123 (user role)

EOF
}

function check_connection() {
    local username=$1
    local password=$2

    if ! curl -s -f -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects > /dev/null; then
        echo "Error: Cannot connect to Schema Registry at ${SCHEMA_REGISTRY_URL}"
        echo "Please check if:"
        echo "  1. Schema Registry container is running (./manage.sh status)"
        echo "  2. Credentials are correct (default: admin/admin123)"
        exit 1
    fi
}

function list_subjects() {
    local username="${1:-$DEFAULT_USERNAME}"
    local password="${2:-$DEFAULT_PASSWORD}"

    print_header "Schema Registry Subjects List"
    echo ""
    echo "Schema Registry: ${SCHEMA_REGISTRY_URL}"
    echo "Username: ${username}"
    echo ""

    check_connection ${username} ${password}

    # List all subjects
    echo "All subjects:"
    echo ""
    SUBJECTS=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects)

    if [ "$(echo ${SUBJECTS} | jq -r 'length' 2>/dev/null)" == "0" ]; then
        echo "  (No subjects found)"
    else
        echo ${SUBJECTS} | jq -r '.[]' 2>/dev/null || echo ${SUBJECTS}
    fi

    echo ""
    echo "----------------------------------------"
    echo "Subject details:"
    echo "----------------------------------------"

    # Get details for each subject
    for subject in $(echo ${SUBJECTS} | jq -r '.[]' 2>/dev/null || echo ""); do
        if [ -n "$subject" ]; then
            echo ""
            echo "Subject: ${subject}"

            # Get latest version
            VERSIONS=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject}/versions)
            LATEST_VERSION=$(echo ${VERSIONS} | jq -r '.[-1]' 2>/dev/null || echo "")

            if [ -n "$LATEST_VERSION" ] && [ "$LATEST_VERSION" != "null" ]; then
                echo "  Latest Version: ${LATEST_VERSION}"

                # Get schema info
                SCHEMA_INFO=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject}/versions/${LATEST_VERSION})
                SCHEMA_ID=$(echo ${SCHEMA_INFO} | jq -r '.id' 2>/dev/null || echo "")
                echo "  Schema ID: ${SCHEMA_ID}"

                # Get compatibility level
                COMPAT=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/config/${subject} 2>/dev/null || echo '{}')
                COMPAT_LEVEL=$(echo ${COMPAT} | jq -r '.compatibilityLevel // "GLOBAL_DEFAULT"' 2>/dev/null || echo "GLOBAL_DEFAULT")
                echo "  Compatibility: ${COMPAT_LEVEL}"
            fi
        fi
    done

    echo ""
}

function get_subject() {
    local subject_name=$1
    local username="${2:-$DEFAULT_USERNAME}"
    local password="${3:-$DEFAULT_PASSWORD}"

    if [ -z "$subject_name" ]; then
        echo "Error: Subject name is required"
        echo "Usage: $0 get <subject-name> [username] [password]"
        exit 1
    fi

    print_header "Subject: ${subject_name}"
    echo ""

    check_connection ${username} ${password}

    # Get all versions
    VERSIONS=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject_name}/versions 2>/dev/null)

    if [ $? -ne 0 ] || [ "$(echo $VERSIONS | jq -r 'type' 2>/dev/null)" == "object" ]; then
        echo "Error: Subject '${subject_name}' not found"
        exit 1
    fi

    echo "Versions: $(echo ${VERSIONS} | jq -r 'join(", ")' 2>/dev/null)"
    echo ""

    # Get latest version details
    LATEST_VERSION=$(echo ${VERSIONS} | jq -r '.[-1]' 2>/dev/null)
    echo "Latest Version: ${LATEST_VERSION}"
    echo ""

    # Get schema
    SCHEMA_INFO=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject_name}/versions/${LATEST_VERSION})
    echo "Schema ID: $(echo ${SCHEMA_INFO} | jq -r '.id')"
    echo ""
    echo "Schema:"
    echo ${SCHEMA_INFO} | jq -r '.schema | fromjson' 2>/dev/null || echo ${SCHEMA_INFO} | jq -r '.schema'
    echo ""

    # Get compatibility
    COMPAT=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/config/${subject_name} 2>/dev/null || echo '{}')
    COMPAT_LEVEL=$(echo ${COMPAT} | jq -r '.compatibilityLevel // "GLOBAL_DEFAULT"' 2>/dev/null)
    echo "Compatibility Level: ${COMPAT_LEVEL}"
    echo ""
}

function add_subject() {
    local subject_name=$1
    local schema_file=$2
    local username="${3:-$DEFAULT_USERNAME}"
    local password="${4:-$DEFAULT_PASSWORD}"

    if [ -z "$subject_name" ] || [ -z "$schema_file" ]; then
        echo "Error: Subject name and schema file are required"
        echo "Usage: $0 add <subject-name> <schema-file> [username] [password]"
        exit 1
    fi

    if [ ! -f "$schema_file" ]; then
        echo "Error: Schema file '${schema_file}' not found"
        exit 1
    fi

    print_header "Registering Schema for Subject: ${subject_name}"
    echo ""

    check_connection ${username} ${password}

    # Read and validate schema file
    SCHEMA_CONTENT=$(cat ${schema_file})

    # Validate JSON
    if ! echo ${SCHEMA_CONTENT} | jq . > /dev/null 2>&1; then
        echo "Error: Invalid JSON in schema file"
        exit 1
    fi

    echo "Schema file: ${schema_file}"
    echo "Subject: ${subject_name}"
    echo ""

    # Prepare request body
    REQUEST_BODY=$(jq -n --arg schema "${SCHEMA_CONTENT}" '{schema: $schema, schemaType: "AVRO"}')

    # Register schema
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -u ${username}:${password} \
        -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        -d "${REQUEST_BODY}" \
        ${SCHEMA_REGISTRY_URL}/subjects/${subject_name}/versions)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
        SCHEMA_ID=$(echo ${BODY} | jq -r '.id')
        echo "✓ Schema registered successfully"
        echo "  Schema ID: ${SCHEMA_ID}"
        echo ""
    else
        echo "✗ Failed to register schema"
        echo "  HTTP Code: ${HTTP_CODE}"
        echo "  Response: ${BODY}"
        exit 1
    fi
}

function delete_subject() {
    local subject_name=$1
    local username="${2:-$DEFAULT_USERNAME}"
    local password="${3:-$DEFAULT_PASSWORD}"

    if [ -z "$subject_name" ]; then
        echo "Error: Subject name is required"
        echo "Usage: $0 delete <subject-name> [username] [password]"
        exit 1
    fi

    print_header "Deleting Subject: ${subject_name}"
    echo ""
    echo "WARNING: This will permanently delete the subject and all its versions!"
    echo ""

    check_connection ${username} ${password}

    # Check if subject exists
    VERSIONS=$(curl -s -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject_name}/versions 2>/dev/null)

    if [ $? -ne 0 ] || [ "$(echo $VERSIONS | jq -r 'type' 2>/dev/null)" == "object" ]; then
        echo "Error: Subject '${subject_name}' not found"
        exit 1
    fi

    echo "Subject exists with versions: $(echo ${VERSIONS} | jq -r 'join(", ")')"
    echo ""

    read -p "Are you sure you want to delete '${subject_name}'? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Deletion cancelled"
        exit 0
    fi

    # Delete subject (soft delete)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
        -u ${username}:${password} \
        ${SCHEMA_REGISTRY_URL}/subjects/${subject_name})

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "200" ]; then
        echo "✓ Subject soft-deleted successfully"
        echo "  Deleted versions: ${BODY}"
        echo ""
        echo "To permanently delete (hard delete), run:"
        echo "  curl -X DELETE -u ${username}:${password} ${SCHEMA_REGISTRY_URL}/subjects/${subject_name}?permanent=true"
        echo ""
    else
        echo "✗ Failed to delete subject"
        echo "  HTTP Code: ${HTTP_CODE}"
        echo "  Response: ${BODY}"
        exit 1
    fi
}

# Main logic
COMMAND="${1:-help}"

case "$COMMAND" in
    list)
        list_subjects "${2}" "${3}"
        ;;
    get)
        get_subject "${2}" "${3}" "${4}"
        ;;
    add)
        add_subject "${2}" "${3}" "${4}" "${5}"
        ;;
    delete)
        delete_subject "${2}" "${3}" "${4}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
