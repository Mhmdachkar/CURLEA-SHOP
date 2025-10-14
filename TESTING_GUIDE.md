# 🧪 Cart & Analytics Testing Guide

## Quick Testing Checklist

### 1. Test Multi-Variant Cart Handling

**Scenario**: Add multiple colors of the same product

```
Steps:
1. Go to DreamCurl™ Midi product page
2. Select "CANDY" color
3. Click "Add to Cart"
4. Go back and select "LATTE" color
5. Click "Add to Cart"
6. Open cart drawer

Expected Result:
✅ Both CANDY and LATTE appear as separate line items
✅ Each has its own quantity controls
✅ Removing one doesn't affect the other
```

### 2. Test Variant-Specific Quantity Updates

**Scenario**: Update quantity for only one variant

```
Steps:
1. Have DreamCurl™ Midi CANDY (qty: 1) in cart
2. Have DreamCurl™ Midi LATTE (qty: 1) in cart
3. Click "+" on CANDY variant
4. Observe cart

Expected Result:
✅ CANDY quantity increases to 2
✅ LATTE quantity stays at 1
✅ Cart total updates correctly
✅ Analytics event fired (check console)
```

### 3. Test Variant-Specific Removal

**Scenario**: Remove only one variant

```
Steps:
1. Have DreamCurl™ Midi CANDY in cart
2. Have DreamCurl™ Midi LATTE in cart
3. Click "Remove" on CANDY variant
4. Observe cart

Expected Result:
✅ CANDY variant removed
✅ LATTE variant remains
✅ Cart total recalculated
✅ Analytics remove event fired
```

### 4. Test Size Options

**Scenario**: Add different sizes of Curly Clip

```
Steps:
1. Go to "Curved Resin Hair Clip" product
2. Select "9-Piece Complete Set"
3. Add to cart
4. Go back and select "4-Piece Type 1"
5. Add to cart
6. Open cart

Expected Result:
✅ Both size options appear separately
✅ Each shows correct size description
✅ Quantity updates are size-specific
```

### 5. Test Analytics Event Tracking

**Scenario**: Verify all events are tracked

```
Steps:
1. Open browser DevTools → Console
2. Add product to cart
3. Check console for: "Cart event tracked: add"
4. Update quantity
5. Check console for: "Cart event tracked: update"
6. Remove item
7. Check console for: "Cart event tracked: remove"
8. Click checkout
9. Check console for: "Cart event tracked: checkout_start"

Expected Result:
✅ All events logged with complete data
✅ cart_total present in all events
✅ variant_id/variant_title populated when applicable
```

### 6. Test Cart Total Calculation

**Scenario**: Verify cart_total is accurate

```
Steps:
1. Add DreamCurl™ Midi CANDY (€39.99) × 2 = €79.98
2. Check analytics event in console
3. Add DreamCurl™ Jumbo LATTE (€44.99) × 1 = €44.99
4. Check analytics event in console

Expected Result:
✅ First event: cart_total = €79.98
✅ Second event: cart_total = €124.97
✅ Cart drawer shows €124.97
```

### 7. Test Checkout Flow

**Scenario**: Verify checkout tracking

```
Steps:
1. Add 3 different products to cart
2. Click "Checkout" button in cart drawer
3. Check console for analytics event

Expected Result:
✅ Alert shows "Checkout functionality coming soon!"
✅ Analytics event: checkout_start
✅ Event includes cart_total
✅ Event includes items_count
```

### 8. Test Clear Cart

**Scenario**: Verify clear cart with confirmation

```
Steps:
1. Add multiple items to cart
2. Click "Clear Cart" button
3. Observe confirmation dialog
4. Click "OK"
5. Check console for analytics events

Expected Result:
✅ Confirmation dialog appears
✅ Analytics remove events for each item
✅ Cart empties after confirmation
✅ "Your cart is empty" message appears
```

---

## Analytics Event Verification

### Add to Cart Event Structure
```javascript
{
  type: 'cart_event',
  data: {
    event_type: 'add',
    product_id: 'dreamcurl-midi',
    title: 'DreamCurl™ Midi',
    price: 39.99,
    quantity: 2,
    variant_id: 'CANDY',
    variant_title: 'CANDY',
    total_value: 79.98,
    cart_total: 79.98,
    session_id: '...',
    visit_id: '...'
  }
}
```

### Update Event Structure
```javascript
{
  type: 'cart_event',
  data: {
    event_type: 'update',
    product_id: 'dreamcurl-midi',
    title: 'DreamCurl™ Midi',
    price: 39.99,
    quantity: 3,
    variant_id: 'CANDY',
    variant_title: 'CANDY',
    total_value: 119.97,
    cart_total: 119.97
  }
}
```

### Remove Event Structure
```javascript
{
  type: 'cart_event',
  data: {
    event_type: 'remove',
    product_id: 'dreamcurl-midi',
    title: 'DreamCurl™ Midi',
    price: 39.99,
    quantity: 3,
    variant_id: 'CANDY',
    variant_title: 'CANDY',
    cart_total: 0
  }
}
```

### Checkout Start Event Structure
```javascript
{
  type: 'cart_event',
  data: {
    event_type: 'checkout_start',
    cart_total: 124.97,
    items_count: 5
  }
}
```

---

## Edge Cases to Test

### 1. Quantity of 0 Removes Item
```
Steps: Decrease quantity to 0
Expected: Item automatically removed from cart
```

### 2. Multiple Clicks on Add to Cart
```
Steps: Rapidly click "Add to Cart" 3 times
Expected: Quantity increases correctly (3 items added)
```

### 3. Cart Persistence
```
Steps: Add items, refresh page
Expected: Cart currently resets (expected behavior)
Note: Persistence is Phase 2 enhancement
```

### 4. Price Parsing with Euro Symbol
```
Steps: Add products with € prices
Expected: Analytics events have numeric prices (no € symbol)
```

### 5. Empty Cart Operations
```
Steps: Try operations on empty cart
Expected: Graceful handling, no errors
```

---

## Browser Console Commands

### Check Analytics SDK
```javascript
// Verify analytics is loaded
window.analytics

// Check session ID
window.analytics.getSessionId()

// Manually track event
window.analytics.trackCart('add', {
  product_id: 'test',
  title: 'Test Product',
  price: 10.99,
  quantity: 1
})
```

### Inspect Cart State
```javascript
// Note: Cart state is in React context
// Can view in React DevTools
```

---

## Expected Console Output

When testing, you should see:
```
✅ Curlea Analytics SDK loaded
✅ Cart event tracked: add { product_id: '...', cart_total: ... }
✅ Cart event tracked: update { product_id: '...', quantity: ... }
✅ Cart event tracked: remove { product_id: '...', cart_total: ... }
✅ Cart event tracked: checkout_start { cart_total: ..., items_count: ... }
```

---

## Common Issues & Solutions

### Issue: Analytics not tracking
**Solution**: Check that analytics.js is loaded (view source, look for `/analytics.js`)

### Issue: Wrong variant updated
**Solution**: This was the bug we fixed. Should not happen now.

### Issue: Cart total incorrect
**Solution**: Check price parsing (€ symbol removal)

### Issue: Duplicate items in cart
**Solution**: Verify variant matching logic (id + color + size)

---

## Performance Testing

### Test Page Load
1. Clear cache
2. Load product page
3. Check Network tab for analytics.js load time

### Test Cart Operations Speed
1. Add 10 items to cart
2. Update quantities multiple times
3. Verify UI remains responsive

### Test Analytics Event Queue
1. Add multiple items rapidly
2. Check that events are batched
3. Verify no events lost

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through cart items
- [ ] Can use Enter to increase/decrease quantity
- [ ] Can use Enter to remove items
- [ ] Can use Escape to close cart drawer

### Screen Reader
- [ ] Cart items announced correctly
- [ ] Quantity changes announced
- [ ] Total price announced

---

## Mobile Testing

### Responsive Design
- [ ] Cart drawer fits mobile screen
- [ ] Quantity controls easily tappable
- [ ] Scrolling works in cart drawer
- [ ] No horizontal overflow

### Touch Interactions
- [ ] Tap to increase/decrease quantity
- [ ] Swipe to close drawer (if implemented)
- [ ] Pinch to zoom disabled in cart

---

## Security Testing

### XSS Prevention
- [ ] Product names with <script> tags sanitized
- [ ] Price manipulation not possible
- [ ] Analytics injection not possible

### Data Validation
- [ ] Negative quantities prevented
- [ ] Invalid product IDs handled
- [ ] Missing prices handled gracefully

---

## Success Criteria

✅ All test scenarios pass  
✅ All analytics events fire correctly  
✅ No console errors  
✅ No browser warnings  
✅ Smooth user experience  
✅ Accurate calculations  
✅ Proper variant handling  

---

**Happy Testing! 🚀**

