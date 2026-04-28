# Location Fields Implementation Guide

## Summary of Changes Made

### 1. Backend Models Updated ✅
- Added `branch` and `year` fields to User model
- Added location fields to Complaint model:
  - `block` (A, B, C, D, E, F)
  - `floor` (varies by block)
  - `room_type` (classroom, lab, washroom, staff_room)
  - `room_number` (auto-generated)
  - `gender` (for washrooms)

### 2. Migration Created ✅
- File: `backend/api/migrations/0004_add_location_fields.py`

### 3. Frontend Registration Updated ✅
- Added Branch dropdown (CSE, IT, ECE, EEE, MECH, CIVIL, CSB, CSM, CSD, MECHATRONICS, MME)
- Added Year dropdown (1st, 2nd, 3rd, 4th Year)
- Updated API call to include new fields

### 4. Complaint Submission - TO BE COMPLETED

The complaint submission form needs these dynamic fields based on category:

#### Categories Requiring Location:
- **Infrastructure** → Block, Floor, Room Type, Room Number
- **Washroom** → Block, Floor, Gender (Boys/Girls)
- **Classroom** → Block, Floor, Room Number
- **Lab** → Block, Floor, Room Number

#### Floor Options by Block:
```javascript
const floorsByBlock = {
  'A': ['Ground Floor', '1st Floor'],
  'B': ['Ground Floor', '1st Floor', '2nd Floor'],
  'C': ['Ground Floor', '1st Floor', '2nd Floor'],
  'D': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
  'E': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor'],
  'F': ['Ground Floor'] // Clubs only
}
```

#### Room Numbering Logic:
- Format: `{Block}{Floor}{Room}` (e.g., D101, D102, etc.)
- Each floor has:
  - 2 Labs (rooms 01 and 06)
  - 4 Classrooms (rooms 02, 03, 04, 05)
  - 1 Staff Room (middle - not numbered in complaints)
  - 2 Washrooms (Boys and Girls - not numbered)

## Next Steps to Complete:

### 1. Update Submit Complaint Form
Add these fields conditionally based on category selection:

```typescript
// Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  block: "",
  floor: "",
  room_type: "",
  room_number: "",
  gender: "" // for washrooms
})

// Show location fields only for relevant categories
const needsLocation = ['infrastructure', 'washroom', 'classroom', 'lab'].includes(formData.category)
```

### 2. Create Dynamic Floor Dropdown
```typescript
const getFloorsForBlock = (block: string) => {
  const floors = {
    'A': 2, 'B': 3, 'C': 3, 'D': 4, 'E': 7, 'F': 1
  }
  const count = floors[block as keyof typeof floors] || 0
  return Array.from({ length: count }, (_, i) => 
    i === 0 ? 'Ground Floor' : `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Floor`
  )
}
```

### 3. Create Room Number Generator
```typescript
const generateRoomNumber = (block: string, floor: string, roomType: string, roomIndex: number) => {
  const floorNum = floor === 'Ground Floor' ? '0' : floor.charAt(0)
  let roomNum = '01'
  
  if (roomType === 'lab') {
    roomNum = roomIndex === 1 ? '01' : '06'
  } else if (roomType === 'classroom') {
    roomNum = `0${roomIndex + 1}` // 02, 03, 04, 05
  }
  
  return `${block}${floorNum}${roomNum}`
}
```

### 4. Update Backend Serializer
Add location fields to ComplaintSerializer in `backend/api/serializers.py`:

```python
class ComplaintSerializer(serializers.ModelSerializer):
    # ... existing fields
    block = serializers.CharField(required=False, allow_blank=True)
    floor = serializers.CharField(required=False, allow_blank=True)
    room_type = serializers.CharField(required=False, allow_blank=True)
    room_number = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
```

### 5. Display Location in Complaint Details
Update complaint display components to show location:

```typescript
{complaint.block && (
  <div className="text-sm">
    <span className="font-medium">Location:</span> 
    Block {complaint.block}, {complaint.floor}
    {complaint.room_number && `, Room ${complaint.room_number}`}
    {complaint.gender && ` (${complaint.gender})`}
  </div>
)}
```

## Testing Checklist:

- [ ] Run migrations: `python manage.py migrate`
- [ ] Test registration with branch and year
- [ ] Test complaint submission with location for infrastructure
- [ ] Test complaint submission with location for washroom (with gender)
- [ ] Test complaint submission with location for classroom
- [ ] Test complaint submission with location for lab
- [ ] Test complaint submission without location (academics, library, etc.)
- [ ] Verify location displays correctly in complaint details
- [ ] Verify location displays correctly in admin dashboard

## Time Estimate:
- Complete implementation: 10-15 minutes
- Testing: 5 minutes
- **Total: 15-20 minutes**

## Current Status:
✅ Backend models updated
✅ Migration created
✅ Registration form updated with branch/year
⏳ Complaint submission form needs location fields
⏳ Complaint display needs location rendering
⏳ Backend serializer needs updating
