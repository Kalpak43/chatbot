for i in {1..120}; do
    code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/chat/sync-message)
    echo "Request $i: $code"
done