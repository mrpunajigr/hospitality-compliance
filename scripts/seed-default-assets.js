const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function seedDefaultAssets() {
  // Load environment variables manually
  const envPath = path.join(__dirname, '../.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key] = value
    }
  })

  // Create admin client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log('🌱 Seeding default assets...')
    
    const defaultAssets = [
      {
        name: 'Chef Workspace',
        type: 'background',
        category: 'kitchen',
        file_url: '/chef-workspace1jpg.jpg',
        file_path: 'backgrounds/chef-workspace1jpg.jpg',
        difficulty: 'medium',
        is_default: true,
        alt_text: 'Professional chef workspace with cooking equipment',
        tags: ['kitchen', 'professional', 'workspace']
      },
      {
        name: 'Clean White',
        type: 'background',
        category: 'neutral',
        file_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+',
        file_path: 'backgrounds/clean-white.svg',
        difficulty: 'easy',
        is_default: true,
        alt_text: 'Clean white background for high contrast',
        tags: ['neutral', 'clean', 'minimal']
      },
      {
        name: 'Dark Gray',
        type: 'background',
        category: 'neutral',
        file_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PC9zdmc+',
        file_path: 'backgrounds/dark-gray.svg',
        difficulty: 'easy',
        is_default: true,
        alt_text: 'Dark gray background for testing',
        tags: ['neutral', 'dark', 'minimal']
      },
      {
        name: 'Medium Gray',
        type: 'background',
        category: 'neutral',
        file_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNmI3Mjg2Ii8+PC9zdmc+',
        file_path: 'backgrounds/medium-gray.svg',
        difficulty: 'medium',
        is_default: true,
        alt_text: 'Medium gray background for testing',
        tags: ['neutral', 'medium', 'minimal']
      }
    ]

    const { data, error } = await supabase
      .from('assets')
      .insert(defaultAssets)
      .select()

    if (error) {
      console.error('❌ Error inserting default assets:', error)
      return
    }

    console.log(`✅ Successfully inserted ${data.length} default assets`)
    data.forEach(asset => {
      console.log(`   📷 ${asset.name} (${asset.type}, ${asset.difficulty})`)
    })
    
  } catch (error) {
    console.error('💥 Error seeding assets:', error.message)
  }
}

seedDefaultAssets()