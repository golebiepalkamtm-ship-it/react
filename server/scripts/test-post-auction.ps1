param(
  [string]$Category = "supplements",
  [string]$Title = "Suplement premium",
  [string]$Description = "Test aukcji suplementu",
  [int]$StartingPrice = 10,
  [int]$BuyNowPrice = 20
)

$end = (Get-Date).AddHours(2).ToString('s')
$payload = @{
  title = $Title
  description = $Description
  startingPrice = $StartingPrice
  buyNowPrice = $BuyNowPrice
  endTime = $end
  category = $Category
  location = "Wrocław, Polska"
} | ConvertTo-Json -Depth 5

Write-Host "POST /api/auctions with payload:`n$payload`n"

$response = Invoke-RestMethod -UseBasicParsing -Uri "http://localhost:8001/api/auctions" -Method Post -ContentType "application/json" -Body $payload
$response | ConvertTo-Json -Depth 5 | Write-Output
