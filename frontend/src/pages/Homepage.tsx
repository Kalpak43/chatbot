import "../styles/chatStyles.css";
import { AIBubble } from "../components/ChatComponent";

function Homepage() {
  const res = `  
\`\`\`Cpp
#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}
\`\`\`

what 
`;

  return (
    <div className="relative h-full overflow-y-auto">
      <AIBubble msg={res} />
    </div>
  );
}

export default Homepage;
