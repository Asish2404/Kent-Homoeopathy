# # $file = "c:\Users\Asish\OneDrive\Desktop\Kent web\Project\src\ProductsCatalog.jsx"
# $content = Get-Content $file -Raw
# $oldText = "import { useCartContext } from `"./Cart/CartContext`";"
# $newText = "import { useCartContext } from `"./Cart/CartContext`";
# import api from `"./services/api`";"
# $content = $content.Replace($oldText, $newText)
# Set-Content $file $content -NoNewline
# Write-Host "Done"
